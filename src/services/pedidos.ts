import { onValue, push, ref, serverTimestamp, update } from 'firebase/database';
import { db } from '../config/firebase';
import { buildPedido, pedidoUpdates, sortPedidos } from '../domain/pedido';
import type { AddressWithId, PedidoWithId, UserProfile } from '../domain/schema';
import type { Service } from '../domain/services';

export async function crearPedido(params: {
  uid: string;
  profile: UserProfile;
  address: AddressWithId;
  service: Service;
  marca: string;
  des: string;
}) {
  const pedidoId = push(ref(db, 'Pedidos')).key!;
  const pedido = buildPedido({ ...params, pedidoId, now: new Date(), createdAt: serverTimestamp() });
  await update(ref(db), pedidoUpdates(params.uid, { ...pedido, pedidoId }));
  return pedidoId;
}

export function subscribeMisPedidos(uid: string, cb: (list: PedidoWithId[]) => void, onError?: (e: Error) => void) {
  return onValue(
    ref(db, `Pedido/${uid}`),
    (snap) => {
      const list: PedidoWithId[] = [];
      snap.forEach((child) => {
        list.push({ key: child.key!, ...child.val() });
      });
      cb(sortPedidos(list));
    },
    onError,
  );
}
