import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";

import { getFirebaseDb } from "../firebase";
import type { User } from "../types";

const USERS_COLLECTION = "users";

export function escucharUsuarios(
  onChange: (users: User[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const db = getFirebaseDb();

  return onSnapshot(
    collection(db, USERS_COLLECTION),
    (snapshot) => {
      const users = snapshot.docs.map((documento) => ({
        id: documento.id,
        ...documento.data(),
      })) as User[];

      onChange(users);
    },
    (error) => {
      console.error("Error escuchando usuarios:", error);
      onError?.(error);
    },
  );
}

export async function obtenerUsuario(uid: string): Promise<User | null> {
  const db = getFirebaseDb();

  const snapshot = await getDoc(
    doc(db, USERS_COLLECTION, uid),
  );

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as User;
}