export const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());

/** Celular colombiano: 10 dígitos empezando por 3 (se permiten espacios y +57). */
export const normalizePhone = (s: string) => s.replace(/[\s-]/g, '').replace(/^\+?57(?=3\d{9}$)/, '');
export const isValidPhone = (s: string) => /^3\d{9}$/.test(normalizePhone(s));

export function passwordError(pass: string, confirm: string): string | null {
  if (pass.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
  if (/\s/.test(pass)) return 'La contraseña no puede tener espacios.';
  if (pass !== confirm) return 'Las contraseñas no coinciden.';
  return null;
}

export const required = (s: string | undefined | null) => (s ?? '').trim().length > 0;
