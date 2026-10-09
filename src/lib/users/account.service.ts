import {
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

import { getFirebaseDb, getFirebaseAuth } from "../firebase";

// Documento de la colección "authorized_users" (el id es el correo)
export interface AuthorizedUser {
  id: string;
  name: string;
  role: string;
  category?: string | null;
  activated?: boolean;
  uid?: string;
}

// Verifica si el correo fue autorizado por el administrador
export async function verificarCorreoAutorizado(
  email: string,
): Promise<AuthorizedUser | null> {
  email = email.toLowerCase().trim();

  const db = getFirebaseDb();

  const ref = doc(db, "authorized_users", email);

  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  return {
    id: snap.id,
    ...(snap.data() as Omit<AuthorizedUser, "id">),
  };
}

export async function activarCuenta(
  email: string,
  password: string,
): Promise<string> {
  email = email.toLowerCase().trim();

  const autorizado = await verificarCorreoAutorizado(email);

  if (!autorizado) {
    throw new Error("Este correo no está autorizado");
  }

  if (autorizado.activated) {
    throw new Error("Esta cuenta ya fue activada");
  }

  const auth = getFirebaseAuth();

  // Crear usuario Firebase
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  const uid = cred.user.uid;

  const db = getFirebaseDb();

  // Crear perfil
  await setDoc(doc(db, "users", uid), {
    name: autorizado.name,
    email,
    role: autorizado.role,
    category: autorizado.category ?? null,
    createdAt: serverTimestamp(),
  });

  // Marcar como activado
  await updateDoc(doc(db, "authorized_users", email), {
    activated: true,
    uid,
  });

  return uid;
}