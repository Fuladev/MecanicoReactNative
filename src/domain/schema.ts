/**
 * Contrato de datos en Firebase Realtime Database (proyecto mecanico-2d3de).
 * La app de proveedores (Mecemp, com.example.mecemp) lee y escribe estos mismos nodos, así que los nombres
 * de nodos y campos legacy NO se cambian. Los campos nuevos se escriben además de los viejos
 * (convivencia) hasta que la app de proveedores se actualice.
 *
 *   Users/{uid}                       UserProfile
 *   Users/{uid}/Direcciones/{dirId}   Address
 *   Pedidos/{pedidoId}                Pedido  (cola global que leen los proveedores)
 *   Pedido/{uid}/{pedidoId}           Pedido  (historial del cliente, MISMO pedidoId)
 */

export type UserProfile = {
  name: string;
  apel: string;
  mail: string;
  phone: string;
  // `pass` ya no se escribe nunca: Firebase Auth guarda la contraseña de forma segura.
};

export type Address = {
  /** Nombre corto de la dirección ("Casa", "Oficina"). Antes faltaba en las direcciones del registro. */
  name: string;
  pais: string;
  departamento: string;
  ciudad: string;
  direccion: string;
  barrio: string;
  casa?: string;
  dirComplete: string;
};

export type AddressWithId = Address & { id: string };

/** Valores legacy que escribe hoy la app y que la app de proveedores espera. */
export const LEGACY_STATE_NUEVO = 'Processing';
export const LEGACY_SIN_MECANICO = 'No se ha asignado un mecanico';

export type EstadoPedido = 'pendiente' | 'asignado' | 'en_curso' | 'finalizado' | 'cancelado';

export type Pedido = {
  // ---- Campos legacy (contrato con la app de proveedores) ----
  name: string;
  apel: string;
  mail: string;
  cel: string;
  dir: string;
  ciu: string;
  barr: string;
  des: string;
  marca: string;
  Tipo: string;
  /** "dd/MM/yy / HH:mm:ss" */
  date: string;
  /** uid del cliente */
  id: string;
  mecanico: string;
  state: string;
  // ---- Campos nuevos (convivencia) ----
  /** Mismo ID en Pedidos/ y en Pedido/{uid}/ */
  pedidoId?: string;
  /** Código normalizado del servicio (ver domain/services.ts) */
  servicio?: string;
  /** Timestamp en ms (ServerValue.TIMESTAMP al escribir) */
  createdAt?: number | object;
  estado?: EstadoPedido;
  direccionId?: string;
};

export type PedidoWithId = Pedido & { key: string };
