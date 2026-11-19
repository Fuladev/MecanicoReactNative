import type { Address } from './schema';

const clean = (s?: string | null) => (s ?? '').trim().replace(/\s+/g, ' ');

/**
 * Arma el texto completo de la dirección a partir de los VALORES del formulario.
 * (La pantalla `Datos` de la app Java concatenaba los objetos EditText y guardaba basura.)
 */
export function buildDirComplete(a: Pick<Address, 'direccion' | 'barrio' | 'casa' | 'ciudad'>): string {
  const parts = [clean(a.direccion), clean(a.casa), clean(a.barrio), clean(a.ciudad)].filter(Boolean);
  return parts.join(', ');
}

export function buildAddress(input: Omit<Address, 'dirComplete' | 'pais'> & { pais?: string }): Address {
  const address: Address = {
    name: clean(input.name) || 'Principal',
    pais: clean(input.pais) || 'Colombia',
    departamento: clean(input.departamento),
    ciudad: clean(input.ciudad),
    direccion: clean(input.direccion),
    barrio: clean(input.barrio),
    dirComplete: '',
  };
  const casa = clean(input.casa);
  if (casa) address.casa = casa;
  address.dirComplete = buildDirComplete(address);
  return address;
}

const looksBroken = (s: string) => /android(x)?\.|widget\.|AppCompatEditText|@[0-9a-f]{5,}/i.test(s);

/** Lee una dirección guardada tolerando datos antiguos incompletos (sin `name`, `dirComplete` dañado). */
export function normalizeStoredAddress(raw: unknown, index = 0): Address {
  const r = (raw ?? {}) as Partial<Record<keyof Address, unknown>>;
  const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));
  const base = {
    name: str(r.name),
    pais: str(r.pais) || 'Colombia',
    departamento: str(r.departamento),
    ciudad: str(r.ciudad),
    direccion: looksBroken(str(r.direccion)) ? '' : str(r.direccion),
    barrio: str(r.barrio),
    casa: str(r.casa) || undefined,
  };
  const stored = str(r.dirComplete);
  const dirComplete = stored && !looksBroken(stored) ? stored : buildDirComplete(base);
  return { ...base, name: base.name || (index === 0 ? 'Principal' : `Dirección ${index + 1}`), dirComplete };
}

export { looksBroken as isBrokenAddressText };
