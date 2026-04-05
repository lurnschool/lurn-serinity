import prisma from './prisma'

export async function checkSubscription(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      stripePriceId: true,
    },
  })

  if (!user) return { active: false }

  // Admin = always active, no payment needed
  if (user.role === 'ADMIN') {
    return { active: true, admin: true }
  }

  // Check active subscription
  if (user.stripeSubscriptionId && user.stripeCurrentPeriodEnd && user.stripeCurrentPeriodEnd > new Date()) {
    return { active: true, plan: user.stripePriceId }
  }

  return { active: false }
}
