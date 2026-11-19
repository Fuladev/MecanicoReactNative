import type { Address, Pedido, UserProfile } from './schema';
import { LEGACY_SIN_MECANICO, LEGACY_STATE_NUEVO } from './schema';
import type { Service } from './services';

const pad = (n: number) => String(n).padStart(2, '0');

/** Formato legacy "dd/MM/yy / HH:mm:ss" que escribe la app Java. */
export function formatLegacyDate(d: Date): string {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${pad(d.getFullYear() % 100)} / ${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}:${pad(d.getSeconds())}`;
}

/** Convierte la fecha legacy a ms para poder ordenar cronológicamente. Devuelve 0 si no se puede leer. */
export function parseLegacyDate(s?: string | null): number {
  if (!s) return 0;
  const m = /^(\d{2})\/(\d{2})\/(\d{2})\s*\/\s*(\d{2}):(\d{2}):(\d{2})$/.exec(s.trim());
  if (!m) return 0;
  const [, dd, mm, yy, hh, mi, ss] = m.map(Number) as unknown as number[];
  return new Date(2000 + yy, mm - 1, dd, hh, mi, ss).getTime();
}

export function pedidoTimestamp(p: Pick<Pedido, 'createdAt' | 'date'>): number {
  return typeof p.createdAt === 'number' ? p.createdAt : parseLegacyDate(p.date);
}

/** Más reciente primero. */
export function sortPedidos<T extends Pick<Pedido, 'createdAt' | 'date'>>(list: T[]): T[] {
  return [...list].sort((a, b) => pedidoTimestamp(b) - pedidoTimestamp(a));
}

export type NewPedidoInput = {
  uid: string;
  pedidoId: string;
  profile: UserProfile;
  address: Address & { id?: string };
  service: Service;
  marca: string;
  des: string;
  now: Date;
  /** Valor a escribir en `createdAt` (serverTimestamp() en producción). */
  createdAt: number | object;
};

export function buildPedido(i: NewPedidoInput): Pedido {
  return {
    name: i.profile.name.trim(),
    apel: i.profile.apel.trim(),
    mail: i.profile.mail.trim(),
    cel: i.profile.phone.trim(),
    dir: i.address.dirComplete,
    ciu: i.address.ciudad,
    barr: i.address.barrio,
    des: i.des.trim(),
    marca: i.marca.trim(),
    Tipo: i.service.tipo,
    date: formatLegacyDate(i.now),
    id: i.uid,
    mecanico: LEGACY_SIN_MECANICO,
    state: LEGACY_STATE_NUEVO,
    pedidoId: i.pedidoId,
    servicio: i.service.code,
    createdAt: i.createdAt,
    estado: 'pendiente',
    ...(i.address.id ? { direccionId: i.address.id } : {}),
  };
}

/** Escritura atómica multi-ruta: mismo ID en la cola global y en el historial del cliente. */
export function pedidoUpdates(uid: string, pedido: Pedido & { pedidoId: string }): Record<string, Pedido> {
  return {
    [`Pedidos/${pedido.pedidoId}`]: pedido,
    [`Pedido/${uid}/${pedido.pedidoId}`]: pedido,
  };
}

const STATE_LABELS: Record<string, string> = {
  Processing: 'En proceso',
  pendiente: 'Pendiente',
  asignado: 'Mecánico asignado',
  en_curso: 'En curso',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
};

export function stateLabel(p: Pick<Pedido, 'state' | 'estado'>): string {
  // `state` es lo que actualiza hoy la app de proveedores, por eso tiene prioridad.
  return STATE_LABELS[p.state] ?? p.state ?? STATE_LABELS[p.estado ?? ''] ?? 'Pendiente';
}
