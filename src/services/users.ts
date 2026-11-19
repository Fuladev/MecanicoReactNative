import { get, onValue, push, ref, remove, set, update } from 'firebase/database';
import { db } from '../config/firebase';
import { normalizeStoredAddress } from '../domain/address';
import type { Address, AddressWithId, UserProfile } from '../domain/schema';

const userRef = (uid: string) => ref(db, `Users/${uid}`);
const dirsRef = (uid: string) => ref(db, `Users/${uid}/Direcciones`);

export function isProfileComplete(p: Partial<UserProfile> | null | undefined): p is UserProfile {
  return !!p && !!p.name?.trim() && !!p.apel?.trim() && !!p.phone?.trim();
}

export function subscribeProfile(uid: string, cb: (p: Partial<UserProfile> | null) => void, onError?: (e: Error) => void) {
  return onValue(
    userRef(uid),
    (snap) => {
      const v = snap.val();
      if (!v) return cb(null);
      cb({ name: v.name ?? '', apel: v.apel ?? '', mail: v.mail ?? '', phone: v.phone ?? '' });
    },
    onError,
  );
}

/**
 * Crea el perfil solo si no existe (login con Google/Apple). Antes se hacía `setValue` en cada login y se
 * borraban nombre, teléfono y direcciones del usuario.
 */
export async function ensureProfile(uid: string, mail: string, displayName?: string | null) {
  const snap = await get(userRef(uid));
  if (snap.exists()) {
    if (!snap.child('mail').val() && mail) await update(userRef(uid), { mail });
    return;
  }
  const [name = '', ...rest] = (displayName ?? '').trim().split(/\s+/);
  await update(userRef(uid), { name, apel: rest.join(' '), mail, phone: '' });
}

/** Actualiza solo los campos del perfil, sin tocar `Direcciones` ni otros nodos. */
export async function saveProfile(uid: string, profile: UserProfile) {
  await update(userRef(uid), {
    name: profile.name.trim(),
    apel: profile.apel.trim(),
    mail: profile.mail.trim(),
    phone: profile.phone.trim(),
  });
}

/** Perfil + primera dirección en una sola escritura atómica. Nunca escribe la contraseña. */
export async function createProfileWithAddress(uid: string, profile: UserProfile, address: Address) {
  const dirId = push(dirsRef(uid)).key!;
  await update(ref(db), {
    [`Users/${uid}/name`]: profile.name.trim(),
    [`Users/${uid}/apel`]: profile.apel.trim(),
    [`Users/${uid}/mail`]: profile.mail.trim(),
    [`Users/${uid}/phone`]: profile.phone.trim(),
    [`Users/${uid}/Direcciones/${dirId}`]: address,
  });
  return dirId;
}

export function subscribeAddresses(uid: string, cb: (list: AddressWithId[]) => void, onError?: (e: Error) => void) {
  return onValue(
    dirsRef(uid),
    (snap) => {
      const list: AddressWithId[] = [];
      let i = 0;
      snap.forEach((child) => {
        list.push({ id: child.key!, ...normalizeStoredAddress(child.val(), i++) });
      });
      cb(list);
    },
    onError,
  );
}

export async function addAddress(uid: string, address: Address) {
  const r = push(dirsRef(uid));
  await set(r, address);
  return r.key!;
}

export async function deleteAddress(uid: string, id: string) {
  await remove(ref(db, `Users/${uid}/Direcciones/${id}`));
}

/** Borra los datos del usuario (perfil, direcciones e historial). Los pedidos de la cola global se conservan. */
export async function deleteUserData(uid: string) {
  await update(ref(db), { [`Users/${uid}`]: null, [`Pedido/${uid}`]: null });
}
