export type Role =
  | "consultante"
  | "administrativo"
  | "asesor"
  | "practicante";

export type CaseStatus =
  | "registrado"
  | "pendiente_validacion"
  | "asignado_asesor"
  | "en_atencion"
  | "seguimiento"
  | "cerrado";

export type AppointmentMode = "presencial" | "virtual";

export type LegalCategoryId =
  | "familia"
  | "penal"
  | "civil"
  | "laboral"
  | "administrativo";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  categoryIds?: LegalCategoryId[];
  activeCases?: number;
}

export interface LegalCategory {
  id: LegalCategoryId;
  name: string;
  description: string;
  keywords: string[];
  advisorIds: string[];
  internIds: string[];
}

export interface Appointment {
  id: string;
  caseId: string;
  date: string;
  time: string;
  mode: AppointmentMode;
  locationOrLink: string;
  status: "programada" | "realizada" | "reprogramada" | "cancelada";
}

export interface CaseNote {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface LegalCase {
  id: string;
  folio: string;
  title: string;
  description: string;
  consultanteId: string;
  consultanteName: string;
  consultanteEmail: string;
  consultantePhone: string;
  proposedCategoryId: LegalCategoryId;
  confirmedCategoryId?: LegalCategoryId;
  classificationConfidence: number;
  classificationRationale: string;
  status: CaseStatus;
  advisorId?: string;
  advisorName?: string;
  internId?: string;
  internName?: string;
  appointmentId?: string;
  notes: CaseNote[];
  createdAt: string;
  updatedAt: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}
