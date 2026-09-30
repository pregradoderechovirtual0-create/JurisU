import {
  addDoc,
  collection,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";

import { getFirebaseDb } from "./firebase";
import type { LegalCase } from "./types";

const CASES_COLLECTION = "cases";

type FirestoreCaseInput = Omit<
  LegalCase,
  "id" | "createdAt" | "updatedAt"
>;

/**
 * Crea un nuevo caso en Firestore.
 */
export async function createCaseInFirestore(
  data: FirestoreCaseInput,
): Promise<string> {
  const db = getFirebaseDb();

  const docRef = await addDoc(collection(db, CASES_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Escucha los casos de Firestore en tiempo real.
 */
export function subscribeCases(
  uid: string,
  role: string,
  onCases: (cases: LegalCase[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const db = getFirebaseDb();

let casesQuery;


if (role === "asesor") {

  casesQuery = query(
    collection(db, CASES_COLLECTION),
    where("advisorId", "==", uid)
  );

} else if (role === "practicante") {

  casesQuery = query(
    collection(db, CASES_COLLECTION),
    where("internId", "==", uid)
  );

} else if (role === "consultante") {

  casesQuery = query(
    collection(db, CASES_COLLECTION),
    where("consultanteId", "==", uid)
  );

} else {

  casesQuery = collection(db, CASES_COLLECTION);

}


return onSnapshot(
  casesQuery,
    (snapshot) => {
      const cases: LegalCase[] = snapshot.docs.map((doc) => {
        const data = doc.data();

        const createdAt =
          data.createdAt?.toDate?.().toISOString() ??
          new Date().toISOString();

        const updatedAt =
          data.updatedAt?.toDate?.().toISOString() ??
          createdAt;

        return {
          id: doc.id,
          ...data,
          createdAt,
          updatedAt,
        } as LegalCase;
      });

      onCases(cases);
    },
    (error) => {
      console.error("Error al escuchar casos:", error);
      onError?.(error);
    },
  );
}