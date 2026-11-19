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

export type StateKind = 'enviado' | 'en_curso' | 'completado' | 'cancelado' | 'otro';

export type StateInfo = {
  kind: StateKind;
  label: string;
  /** Paso en la línea de tiempo: 0 enviado, 1 en curso, 2 completado. */
  step: number;
};

const ENVIADO: StateInfo = { kind: 'enviado', label: 'Enviado', step: 0 };
const EN_CURSO: StateInfo = { kind: 'en_curso', label: 'En curso', step: 1 };
const COMPLETADO: StateInfo = { kind: 'completado', label: 'Completado', step: 2 };

const BY_STATE: Record<string, StateInfo> = { Processing: ENVIADO, inProcess: EN_CURSO, Complete: COMPLETADO };

const BY_ESTADO: Record<string, StateInfo> = {
  pendiente: ENVIADO,
  asignado: EN_CURSO,
  en_curso: EN_CURSO,
  finalizado: COMPLETADO,
  cancelado: { kind: 'cancelado', label: 'Cancelado', step: 0 },
};

/** `state` es lo que actualiza la app de proveedores, por eso tiene prioridad sobre `estado`. */
export function stateInfo(p: Pick<Pedido, 'state' | 'estado'>): StateInfo {
  if (p.state && BY_STATE[p.state]) return BY_STATE[p.state];
  if (p.state) return { kind: 'otro', label: p.state, step: 0 };
  return BY_ESTADO[p.estado ?? ''] ?? ENVIADO;
}

export function stateLabel(p: Pick<Pedido, 'state' | 'estado'>): string {
  return stateInfo(p).label;
}

/** Un pedido sigue "activo" mientras no esté completado ni cancelado. */
export const isActive = (p: Pick<Pedido, 'state' | 'estado'>) => {
  const k = stateInfo(p).kind;
  return k === 'enviado' || k === 'en_curso';
};

export type PedidoAction = 'cancelar' | 'eliminar';

/**
 * Qué puede hacer el cliente con el pedido:
 * - enviado: cancelarlo (se borra de la cola y del historial, así ningún técnico lo toma).
 * - en curso: nada, un técnico ya va en camino (igual que la app iOS, que deshabilita "Eliminar").
 * - completado / otro: quitarlo de su historial (la copia del técnico se conserva).
 */
export function pedidoAction(p: Pick<Pedido, 'state' | 'estado'>): PedidoAction | null {
  const k = stateInfo(p).kind;
  if (k === 'enviado') return 'cancelar';
  if (k === 'en_curso') return null;
  return 'eliminar';
}

export function deletePedidoUpdates(uid: string, pedidoId: string, action: PedidoAction): Record<string, null> {
  const updates: Record<string, null> = { [`Pedido/${uid}/${pedidoId}`]: null };
  if (action === 'cancelar') updates[`Pedidos/${pedidoId}`] = null;
  return updates;
}

/** `mecanico` llega vacío cuando lo toma la app iOS y con el texto legacy mientras nadie lo ha tomado. */
export function mecanicoLabel(p: Pick<Pedido, 'mecanico' | 'state' | 'estado'>): string | null {
  const m = (p.mecanico ?? '').trim();
  if (m && !/no se ha asignado/i.test(m)) return m;
  return stateInfo(p).step >= 1 ? 'Técnico asignado' : null;
}

/** Convierte "17.85", "17,85", "1.500.000" o 1500 a número. Devuelve null si no es un número. */
export function parseMoney(v?: string | number | null): number | null {
  if (v == null || v === '') return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const cleaned = v.replace(/[$\s]/g, '');
  let normalized = cleaned;
  if (/,\d{1,2}$/.test(cleaned)) normalized = cleaned.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) normalized = cleaned.replace(/\./g, '');
  else normalized = cleaned.replace(/,/g, '');
  if (!normalized) return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export function formatMoney(v?: string | number | null): string {
  const n = parseMoney(v);
  if (n == null) return '—';
  return `$${Math.round(n).toLocaleString('es-CO')}`;
}
