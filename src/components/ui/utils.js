// Petit helper de classes — équivalent minimal de clsx/cn, sans dépendance.
export function cn(...inputs) {
  return inputs
    .flat(Infinity)
    .filter(x => typeof x === 'string' && x.trim().length > 0)
    .join(' ')
}
