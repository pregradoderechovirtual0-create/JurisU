import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type {
  Appointment,
  CaseNote,
  CaseStatus,
  LegalCategoryId,
} from "./types";

const CASES_COLLECTION = "cases";

function caseRef(caseId: string) {
  return doc(getFirebaseDb(), CASES_COLLECTION, caseId);
}

const now = () => new Date().toISOString();

export function validateCaseInFirestore(
  caseId: string,
  categoryId: LegalCategoryId,
  advisorId: string,
  advisorName: string | undefined,
) {
  return updateDoc(caseRef(caseId), {
    confirmedCategoryId: categoryId,
    advisorId,
    advisorName: advisorName ?? null,
    status: "asignado_asesor" satisfies CaseStatus,
    updatedAt: now(),
  });
}

export function assignInternInFirestore(
  caseId: string,
  internId: string,
  internName: string | undefined,
  appointment: Appointment | null,
) {
  return updateDoc(caseRef(caseId), {
    internId,
    internName: internName ?? null,
    // Solo se toca la cita si se programó una; al reasignar sin cita se conserva la anterior
    ...(appointment ? { appointmentId: appointment.id, appointment } : {}),
    status: "en_atencion" satisfies CaseStatus,
    updatedAt: now(),
  });
}

export function addNoteInFirestore(caseId: string, note: CaseNote) {
  return updateDoc(caseRef(caseId), {
    notes: arrayUnion(note),
    updatedAt: now(),
  });
}

export function updateStatusInFirestore(caseId: string, status: CaseStatus) {
  return updateDoc(caseRef(caseId), {
    status,
    updatedAt: now(),
  });
}