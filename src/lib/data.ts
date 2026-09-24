import type { LegalCase, LegalCategory, User } from "./types";

export const CATEGORIES: LegalCategory[] = [
  {
    id: "familia",
    name: "Derecho de Familia",
    description: "Custodia, alimentos, divorcio, violencia intrafamiliar y parento-filial.",
    keywords: [
      "custodia",
      "alimentos",
      "pensión",
      "divorcio",
      "separación",
      "violencia",
      "hijos",
      "padre",
      "madre",
      "familiar",
      "matrimonio",
      "visita",
    ],
    advisorIds: ["asesor-1"],
    internIds: ["prac-1", "prac-2"],
  },
  {
    id: "penal",
    name: "Derecho Penal",
    description: "Denuncias, querellas, lesiones, hurtos y acompañamiento procesal.",
    keywords: [
      "denuncia",
      "delito",
      "hurto",
      "robo",
      "lesiones",
      "amenaza",
      "fiscalía",
      "penal",
      "querella",
      "violencia sexual",
    ],
    advisorIds: ["asesor-2"],
    internIds: ["prac-3"],
  },
  {
    id: "civil",
    name: "Derecho Civil",
    description: "Contratos, deudas, propiedad, arrendamiento y responsabilidad civil.",
    keywords: [
      "contrato",
      "deuda",
      "arrendamiento",
      "arriendo",
      "propiedad",
      "inmueble",
      "civil",
      "indemnización",
      "herencia",
      "sucesión",
    ],
    advisorIds: ["asesor-1", "asesor-3"],
    internIds: ["prac-2", "prac-4"],
  },
  {
    id: "laboral",
    name: "Derecho Laboral",
    description: "Despidos, liquidaciones, acoso laboral y seguridad social.",
    keywords: [
      "despido",
      "trabajo",
      "laboral",
      "salario",
      "liquidación",
      "contrato laboral",
      "acoso",
      "eps",
      "pensión laboral",
      "horas extras",
    ],
    advisorIds: ["asesor-3"],
    internIds: ["prac-1", "prac-4"],
  },
  {
    id: "administrativo",
    name: "Derecho Administrativo",
    description: "Trámites con entidades públicas, tutelas y derechos de petición.",
    keywords: [
      "tutela",
      "petición",
      "entidad",
      "público",
      "administrativo",
      "municipal",
      "alcaldía",
      "salud pública",
      "subsidio",
      "tramite",
      "trámite",
    ],
    advisorIds: ["asesor-2"],
    internIds: ["prac-3"],
  },
];

export const USERS: User[] = [
  {
    id: "cons-1",
    name: "Laura Mendoza",
    email: "laura.mendoza@correo.com",
    role: "consultante",
  },
  {
    id: "cons-2",
    name: "Carlos Ríos",
    email: "carlos.rios@correo.com",
    role: "consultante",
  },
  {
    id: "admin-1",
    name: "María Isabel Peña",
    email: "admin@consultorio.edu",
    role: "administrativo",
  },
  {
    id: "asesor-1",
    name: "Dr. Andrés Vallejo",
    email: "avallejo@consultorio.edu",
    role: "asesor",
    categoryIds: ["familia", "civil"],
    activeCases: 4,
  },
  {
    id: "asesor-2",
    name: "Dra. Sofía Herrera",
    email: "sherrera@consultorio.edu",
    role: "asesor",
    categoryIds: ["penal", "administrativo"],
    activeCases: 3,
  },
  {
    id: "asesor-3",
    name: "Dr. Camilo Duarte",
    email: "cduarte@consultorio.edu",
    role: "asesor",
    categoryIds: ["laboral", "civil"],
    activeCases: 2,
  },
  {
    id: "prac-1",
    name: "Valentina Gómez",
    email: "vgomez@estudiante.edu",
    role: "practicante",
    categoryIds: ["familia", "laboral"],
    activeCases: 2,
  },
  {
    id: "prac-2",
    name: "Julián Castro",
    email: "jcastro@estudiante.edu",
    role: "practicante",
    categoryIds: ["familia", "civil"],
    activeCases: 1,
  },
  {
    id: "prac-3",
    name: "Daniela Ortiz",
    email: "dortiz@estudiante.edu",
    role: "practicante",
    categoryIds: ["penal", "administrativo"],
    activeCases: 2,
  },
  {
    id: "prac-4",
    name: "Mateo Quintero",
    email: "mquintero@estudiante.edu",
    role: "practicante",
    categoryIds: ["civil", "laboral"],
    activeCases: 1,
  },
];

export const DEMO_USERS = USERS.filter((u) =>
  ["consultante", "administrativo", "asesor", "practicante"].includes(u.role),
).reduce<User[]>((acc, user) => {
  if (!acc.some((u) => u.role === user.role)) acc.push(user);
  return acc;
}, []);

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const SEED_CASES: LegalCase[] = [
  {
    id: "case-1",
    folio: "CJ-2026-0014",
    title: "Solicitud de custodia y cuota de alimentos",
    description:
      "Necesito orientación para regular la custodia de mis dos hijos y fijar una cuota de alimentos. El padre no cumple con los acuerdos verbales de visita.",
    consultanteId: "cons-1",
    consultanteName: "Laura Mendoza",
    consultanteEmail: "laura.mendoza@correo.com",
    consultantePhone: "3001234567",
    proposedCategoryId: "familia",
    confirmedCategoryId: "familia",
    classificationConfidence: 0.92,
    classificationRationale:
      "El relato menciona custodia, alimentos e hijos: indicadores claros de Derecho de Familia.",
    status: "en_atencion",
    advisorId: "asesor-1",
    advisorName: "Dr. Andrés Vallejo",
    internId: "prac-1",
    internName: "Valentina Gómez",
    appointmentId: "apt-1",
    notes: [
      {
        id: "note-1",
        authorId: "prac-1",
        authorName: "Valentina Gómez",
        content:
          "Se revisó documentación de identidad y se solicitó registro civil de los menores.",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "case-2",
    folio: "CJ-2026-0018",
    title: "Despido sin liquidación completa",
    description:
      "Fui despedido de mi trabajo hace dos semanas y la empresa no me entregó la liquidación ni el pago de horas extras.",
    consultanteId: "cons-2",
    consultanteName: "Carlos Ríos",
    consultanteEmail: "carlos.rios@correo.com",
    consultantePhone: "3109876543",
    proposedCategoryId: "laboral",
    classificationConfidence: 0.88,
    classificationRationale:
      "Palabras clave: despido, trabajo, liquidación y horas extras → Derecho Laboral.",
    status: "pendiente_validacion",
    notes: [],
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "case-3",
    folio: "CJ-2026-0012",
    title: "Tutela por negación de medicamento",
    description:
      "La EPS negó un medicamento ordenado por el médico. Quiero interponer una tutela y un derecho de petición ante la entidad.",
    consultanteId: "cons-1",
    consultanteName: "Laura Mendoza",
    consultanteEmail: "laura.mendoza@correo.com",
    consultantePhone: "3001234567",
    proposedCategoryId: "administrativo",
    confirmedCategoryId: "administrativo",
    classificationConfidence: 0.85,
    classificationRationale:
      "Tutela, petición y entidad pública apuntan a Derecho Administrativo.",
    status: "asignado_asesor",
    advisorId: "asesor-2",
    advisorName: "Dra. Sofía Herrera",
    notes: [],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "case-4",
    folio: "CJ-2026-0009",
    title: "Contrato de arrendamiento incumplido",
    description:
      "El arrendador no devolvió el depósito del inmueble y hay un contrato firmado que no se está respetando.",
    consultanteId: "cons-2",
    consultanteName: "Carlos Ríos",
    consultanteEmail: "carlos.rios@correo.com",
    consultantePhone: "3109876543",
    proposedCategoryId: "civil",
    confirmedCategoryId: "civil",
    classificationConfidence: 0.9,
    classificationRationale:
      "Contrato, arrendamiento e inmueble son señales de Derecho Civil.",
    status: "seguimiento",
    advisorId: "asesor-3",
    advisorName: "Dr. Camilo Duarte",
    internId: "prac-4",
    internName: "Mateo Quintero",
    appointmentId: "apt-2",
    notes: [
      {
        id: "note-2",
        authorId: "prac-4",
        authorName: "Mateo Quintero",
        content: "Se envió requerimiento formal al arrendador. Esperando respuesta.",
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

export const SEED_APPOINTMENTS = [
  {
    id: "apt-1",
    caseId: "case-1",
    date: daysFromNow(2),
    time: "10:00",
    mode: "presencial" as const,
    locationOrLink: "Sala 2 — Consultorio Jurídico, Edificio A",
    status: "programada" as const,
  },
  {
    id: "apt-2",
    caseId: "case-4",
    date: daysFromNow(5),
    time: "15:30",
    mode: "virtual" as const,
    locationOrLink: "https://meet.consultorio.edu/cj-0009",
    status: "programada" as const,
  },
];

export const ROLE_LABELS: Record<string, string> = {
  consultante: "Consultante",
  administrativo: "Administrativo",
  asesor: "Asesor jurídico",
  practicante: "Practicante",
};

export const STATUS_LABELS: Record<string, string> = {
  registrado: "Registrado",
  pendiente_validacion: "Pendiente de validación",
  asignado_asesor: "Asignado a asesor",
  en_atencion: "En atención",
  seguimiento: "En seguimiento",
  cerrado: "Cerrado",
};

export const STATUS_COLORS: Record<string, string> = {
  registrado: "bg-slate-100 text-slate-700",
  pendiente_validacion: "bg-amber-100 text-amber-800",
  asignado_asesor: "bg-sky-100 text-sky-800",
  en_atencion: "bg-teal-100 text-teal-800",
  seguimiento: "bg-indigo-100 text-indigo-800",
  cerrado: "bg-emerald-100 text-emerald-800",
};
