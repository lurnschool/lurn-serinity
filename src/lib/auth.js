import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from './prisma'
import bcrypt from 'bcryptjs'

/**
 * NextAuth config — PR 2B credentials sérieux.
 *
 * Mécanique sessionVersion :
 * - À la connexion, on lit `user.sessionVersion` en DB et on l'embarque dans le JWT.
 * - À chaque appel à `getServerSession()` (= chaque request authentifiée serveur),
 *   `callbacks.session` lit la version actuelle en DB et la compare à celle du JWT.
 * - Si elles diffèrent (parce que l'utilisateur a changé son mot de passe et
 *   sessionVersion a été incrémenté), on retourne une session sans user
 *   → NextAuth invalide la session, l'utilisateur doit se relogger.
 *
 * Coût : 1 lecture DB ciblée (cuid + 3 colonnes) par requête authentifiée serveur.
 * Pas de cache mémoire en sécurité (le chef de projet a explicitement refusé).
 *
 * mustChangePassword est aussi dans le JWT pour permettre au middleware
 * (qui ne peut pas lire Prisma en Edge runtime) de rediriger sans round-trip DB.
 * Le flag est resynchronisé depuis la DB à chaque session check pour refléter
 * l'état réel (au cas où un changement aurait eu lieu hors du flow normal).
 */

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        // Audit lastLoginAt — best effort, on n'échoue pas la connexion si KO
        prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        }).catch(() => { /* ignore */ })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
          sessionVersion: user.sessionVersion,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Sign-in : on capture les infos depuis l'objet `user` retourné par authorize
      if (user) {
        token.id = user.id
        token.role = user.role
        token.mustChangePassword = user.mustChangePassword || false
        token.sessionVersion = typeof user.sessionVersion === 'number' ? user.sessionVersion : 0
      }
      // Update via session.update() côté client (utilisé après /change-password
      // pour pousser le nouveau sessionVersion dans le JWT sans relogin)
      if (trigger === 'update' && session) {
        if (typeof session.mustChangePassword === 'boolean') {
          token.mustChangePassword = session.mustChangePassword
        }
        if (typeof session.sessionVersion === 'number') {
          token.sessionVersion = session.sessionVersion
        }
      }
      return token
    },
    async session({ session, token }) {
      if (!token?.id) return session

      // Vérification serveur stricte : on relit sessionVersion + flags depuis la DB.
      // Pas de cache mémoire (sécurité prioritaire sur perf).
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: {
            sessionVersion: true,
            mustChangePassword: true,
            role: true,
            email: true,
            name: true,
          },
        })

        // User supprimé ou introuvable → invalider la session
        if (!dbUser) {
          return { ...session, user: undefined, expires: new Date(0).toISOString() }
        }

        // sessionVersion mismatch → JWT obsolète (post change-password)
        if (dbUser.sessionVersion !== token.sessionVersion) {
          return { ...session, user: undefined, expires: new Date(0).toISOString() }
        }

        // Resync depuis la DB (état canonique)
        session.user = {
          ...(session.user || {}),
          id: token.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
          mustChangePassword: dbUser.mustChangePassword,
        }
        return session
      } catch (e) {
        // En cas d'erreur DB, on invalide par sécurité (fail-closed)
        // eslint-disable-next-line no-console
        console.error('[auth.session] DB check failed:', e?.message || e)
        return { ...session, user: undefined, expires: new Date(0).toISOString() }
      }
    },
  },
  pages: {
    signIn: '/connexion',
    error: '/connexion',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
