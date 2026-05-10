/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand sport — lime/citron vif (plus énergique que vert plat).
        brand: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Accent secondaire — orange chaud (feu, énergie, performance)
        accent: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        // Tertiaire — violet électrique (premium, force)
        plum: {
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
        },
        // Cyan vibrant (cardio, hydratation, fraîcheur)
        ocean: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        // Rose / fuchsia (motivation, glutes, fessiers)
        rose: {
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
        },
        // Surfaces sombres — graduées avec un peu plus de chaleur.
        surface: {
          0:   '#0a0a0e',
          50:  '#10101a',
          100: '#171724',
          200: '#1f1f30',
          300: '#2a2a3e',
          400: '#3a3a52',
          500: '#5a5a78',
          600: '#828aa8',
          700: '#a8b0c8',
          800: '#cdd0e0',
          900: '#e8eaf2',
          950: '#f5f6fa',
        },
        // Sémantique — couleurs métier constantes.
        success: { DEFAULT: '#22c55e', soft: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34, 197, 94, 0.28)' },
        warning: { DEFAULT: '#f59e0b', soft: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.28)' },
        danger:  { DEFAULT: '#ef4444', soft: 'rgba(239, 68, 68, 0.12)',  border: 'rgba(239, 68, 68, 0.28)' },
        info:    { DEFAULT: '#3b82f6', soft: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.28)' },
        // Catégories — pour tagging programmes / objectifs.
        cat: {
          masse:    '#a855f7', // prise de masse — violet
          perte:    '#f97316', // perte de poids — orange
          forme:    '#3b82f6', // remise en forme — bleu
          endurance:'#06b6d4', // endurance — cyan
          force:    '#ef4444', // force — rouge
          mobilite: '#14b8a6', // souplesse — teal
        },
      },
      backgroundImage: {
        // Gradients premium — utilisés sur les hero, cards majeures, CTAs.
        'hero-night':    'linear-gradient(135deg, #0a0a0e 0%, #1a0f2e 40%, #2a1a4a 70%, #0f1d3a 100%)',
        'hero-flame':    'linear-gradient(135deg, #f97316 0%, #f43f5e 50%, #a855f7 100%)',
        'hero-ocean':    'linear-gradient(135deg, #06b6d4 0%, #3b82f6 60%, #6366f1 100%)',
        'hero-gold':     'linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ec4899 100%)',
        'hero-mint':     'linear-gradient(135deg, #22c55e 0%, #06b6d4 100%)',
        'hero-purple':   'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
        'hero-sunset':   'linear-gradient(135deg, #f97316 0%, #ef4444 60%, #a855f7 100%)',
        'glass-card':    'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        // Hiérarchie stricte — voir docs/product/benchmark-fitness-apps.md.
        'caption': ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.04em', fontWeight: '500' }],
        'micro':   ['0.75rem',   { lineHeight: '1.4',  fontWeight: '500' }],
        'body':    ['0.875rem',  { lineHeight: '1.5',  fontWeight: '400' }],
        'heading': ['1.0625rem', { lineHeight: '1.35', letterSpacing: '-0.01em', fontWeight: '600' }],
        'title':   ['1.375rem',  { lineHeight: '1.25', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display': ['2.25rem',   { lineHeight: '1.1',  letterSpacing: '-0.03em', fontWeight: '700' }],
        'hero':    ['3rem',      { lineHeight: '1.05', letterSpacing: '-0.035em', fontWeight: '700' }],
      },
      spacing: {
        // Grille 4px stricte — déjà dans Tailwind, on ajoute juste les
        // valeurs orientées composants.
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        'nav-h':       '3.5rem', // hauteur header mobile
        'bottomnav-h': '4.25rem', // hauteur bottom nav adhérent
        'sidebar-w':   '16rem',
      },
      borderRadius: {
        'sm':  '0.375rem',
        'md':  '0.5rem',
        'lg':  '0.75rem',
        'xl':  '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        'pill':'9999px',
      },
      boxShadow: {
        'card':         '0 1px 2px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'card-hover':   '0 12px 32px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(34, 197, 94, 0.20)',
        'modal':        '0 32px 80px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        'glow-brand':   '0 0 32px rgba(34, 197, 94, 0.45), 0 0 12px rgba(34, 197, 94, 0.3)',
        'glow-orange':  '0 0 32px rgba(249, 115, 22, 0.45), 0 0 12px rgba(249, 115, 22, 0.3)',
        'glow-violet':  '0 0 32px rgba(168, 85, 247, 0.45), 0 0 12px rgba(168, 85, 247, 0.3)',
        'glow-ocean':   '0 0 32px rgba(6, 182, 212, 0.45), 0 0 12px rgba(6, 182, 212, 0.3)',
        'glow-rose':    '0 0 32px rgba(244, 63, 94, 0.45), 0 0 12px rgba(244, 63, 94, 0.3)',
        'inset-soft':   'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'inset-glow':   'inset 0 0 24px rgba(34, 197, 94, 0.15)',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out forwards',
        'slide-up':   'slideUp 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in':   'slideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pop':        'pop 0.18s ease-out forwards',
        'pulse-soft': 'pulseSoft 2.4s ease-in-out infinite',
        'shimmer':    'shimmer 2.5s linear infinite',
        'aurora':     'aurora 12s ease-in-out infinite',
        'float':      'float 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:   { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideIn:   { '0%': { opacity: '0', transform: 'translateX(-6px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        pop:       { '0%': { transform: 'scale(0.97)' }, '100%': { transform: 'scale(1)' } },
        pulseSoft: { '0%, 100%': { opacity: '0.6' }, '50%': { opacity: '1' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        aurora:    {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%':      { transform: 'translate(30px, -20px) scale(1.05)' },
          '66%':      { transform: 'translate(-20px, 30px) scale(0.95)' },
        },
        float:     {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
      },
      transitionTimingFunction: {
        'out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'snap':     'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      maxWidth: {
        'app':     '80rem',  // 1280px — coach
        'reading': '42rem',  // forms longs
        'mobile':  '28rem',  // adhérent contenu
      },
    },
  },
  plugins: [],
}
