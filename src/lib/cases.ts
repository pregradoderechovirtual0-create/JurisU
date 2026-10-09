import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  type DocumentData,
  type Query,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";

import { getFirebaseDb } from "./firebase";
import type { LegalCase, SessionUser } from "./types";

const CASES_COLLECTION = "cases";

type FirestoreCaseInput = Omit<LegalCase, "id" | "createdAt" | "updatedAt">;

export interface CasesScope {
  id: string;
  email: string;
  role: SessionUser["role"];
}

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

// Cada rol consulta solo los casos que le corresponden.
// Devuelve una lista de consultas porque el consultante necesita dos:
// los casos creados con su cuenta y los enviados como invitado con su correo.
function buildQueries(scope: CasesScope): Query[] {
  const col = collection(getFirebaseDb(), CASES_COLLECTION);

  switch (scope.role) {
    case "administrativo":
    case "asesor":
      return [col];
    case "practicante":
      return [query(col, where("internId", "==", scope.id))];
    case "consultante":
    default: {
      const queries: Query[] = [
        query(col, where("consultanteId", "==", scope.id)),
      ];
      const email = scope.email.trim().toLowerCase();
      if (email) {
        queries.push(query(col, where("consultanteEmail", "==", email)));
      }
      return queries;
    }
  }
}

// Acepta Timestamp de Firestore o texto ISO
function toIso(value: unknown, fallback: string): string {
  if (typeof value === "string") return value;
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return fallback;
}

function mapCase(d: QueryDocumentSnapshot<DocumentData>): LegalCase {
  const data = d.data();
  const createdAt = toIso(data.createdAt, new Date().toISOString());
  const updatedAt = toIso(data.updatedAt, createdAt);

  return {
    id: d.id,
    ...data,
    createdAt,
    updatedAt,
  } as LegalCase;
}

/**
 * Escucha en tiempo real los casos que el usuario puede ver según su rol.
 */
export function subscribeCases(
  scope: CasesScope,
  onCases: (cases: LegalCase[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const queries = buildQueries(scope);
  const results: LegalCase[][] = queries.map(() => []);

  const emit = () => {
    // Une los resultados y elimina duplicados por id
    const merged = new Map<string, LegalCase>();
    results.flat().forEach((c) => merged.set(c.id, c));
    onCases([...merged.values()]);
  };

  const unsubs = queries.map((q, i) =>
    onSnapshot(
      q,
      (snapshot) => {
        results[i] = snapshot.docs.map(mapCase);
        emit();
      },
      (error) => {
        console.error("Error al escuchar casos:", error);
        onError?.(error);
      },
    ),
  );

  return () => unsubs.forEach((u) => u());
}