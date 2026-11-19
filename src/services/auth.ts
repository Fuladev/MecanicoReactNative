import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  GoogleAuthProvider,
  OAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from 'firebase/auth';
import { Platform } from 'react-native';
import { auth, GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from '../config/firebase';
import { ensureProfile, deleteUserData } from './users';

let googleConfigured = false;
function configureGoogle() {
  if (googleConfigured) return;
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID, iosClientId: GOOGLE_IOS_CLIENT_ID });
  googleConfigured = true;
}

export class CancelledError extends Error {
  constructor() {
    super('cancelled');
  }
}

export async function loginWithEmail(mail: string, pass: string) {
  return signInWithEmailAndPassword(auth, mail.trim(), pass);
}

export async function registerWithEmail(mail: string, pass: string) {
  const cred = await createUserWithEmailAndPassword(auth, mail.trim(), pass);
  sendEmailVerification(cred.user).catch(() => undefined);
  return cred.user;
}

export async function resetPassword(mail: string) {
  await sendPasswordResetEmail(auth, mail.trim());
}

export async function loginWithGoogle() {
  configureGoogle();
  if (Platform.OS === 'android') await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  let idToken: string | null = null;
  try {
    const res = await GoogleSignin.signIn();
    if (!isSuccessResponse(res)) throw new CancelledError();
    idToken = res.data.idToken;
  } catch (e) {
    if (e instanceof CancelledError) throw e;
    if (isErrorWithCode(e) && (e.code === statusCodes.SIGN_IN_CANCELLED || e.code === statusCodes.IN_PROGRESS)) {
      throw new CancelledError();
    }
    throw e;
  }
  if (!idToken) throw new Error('Google no devolvió un idToken. Revisa el webClientId.');
  const cred = await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
  await ensureProfile(cred.user.uid, cred.user.email ?? '', cred.user.displayName);
  return cred.user;
}

export const isAppleAvailable = () => (Platform.OS === 'ios' ? AppleAuthentication.isAvailableAsync() : Promise.resolve(false));

/** Sign in with Apple: requisito de App Store cuando se ofrece login con Google. */
export async function loginWithApple() {
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
  let res: AppleAuthentication.AppleAuthenticationCredential;
  try {
    res = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });
  } catch (e) {
    if ((e as { code?: string }).code === 'ERR_REQUEST_CANCELED') throw new CancelledError();
    throw e;
  }
  if (!res.identityToken) throw new Error('Apple no devolvió un token.');
  const provider = new OAuthProvider('apple.com');
  const cred = await signInWithCredential(auth, provider.credential({ idToken: res.identityToken, rawNonce }));
  const fullName = [res.fullName?.givenName, res.fullName?.familyName].filter(Boolean).join(' ');
  await ensureProfile(cred.user.uid, cred.user.email ?? res.email ?? '', fullName || cred.user.displayName);
  return cred.user;
}

export async function signOut() {
  try {
    configureGoogle();
    await GoogleSignin.signOut();
  } catch {
    // no había sesión de Google
  }
  await fbSignOut(auth);
}

/** Elimina la cuenta (requisito de App Store y Play Store para apps con registro). */
export async function deleteAccount() {
  const user = auth.currentUser;
  if (!user) return;
  // Firebase exige un login reciente para borrar la cuenta. Se comprueba antes de borrar datos para no
  // dejar una cuenta viva sin perfil.
  const last = Date.parse(user.metadata.lastSignInTime ?? '');
  if (!last || Date.now() - last > 4 * 60 * 1000) {
    throw Object.assign(new Error('requires-recent-login'), { code: 'auth/requires-recent-login' });
  }
  await deleteUserData(user.uid);
  await deleteUser(user);
}

export function authErrorMessage(e: unknown): string {
  const code = (e as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-email':
      return 'El correo no es válido.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Correo o contraseña incorrectos.';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con ese correo.';
    case 'auth/weak-password':
      return 'La contraseña es muy débil (mínimo 6 caracteres).';
    case 'auth/network-request-failed':
      return 'No hay conexión a internet. Intenta de nuevo.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Espera un momento e intenta de nuevo.';
    case 'auth/requires-recent-login':
      return 'Por seguridad, cierra sesión, vuelve a entrar e intenta de nuevo.';
    case 'auth/account-exists-with-different-credential':
      return 'Ese correo ya está registrado con otro método de inicio de sesión.';
    default:
      return 'Ocurrió un error. Intenta de nuevo.';
  }
}
