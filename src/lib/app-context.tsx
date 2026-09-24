"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { classifyCase, nextFolio } from "./classify";
import {
  CATEGORIES,
  SEED_APPOINTMENTS,
  SEED_CASES,
  USERS,
} from "./data";
import type {
  Appointment,
  CaseStatus,
  LegalCase,
  LegalCategoryId,
  SessionUser,
  User,
} from "./types";

const STORAGE_KEY = "jurisu-consultorio-v1";

interface PersistedState {
  cases: LegalCase[];
  appointments: Appointment[];
  session: SessionUser | null;
}

interface CreateCaseInput {
  title: string;
  description: string;
  consultanteName: string;
  consultanteEmail: string;
  consultantePhone: string;
}

interface AppContextValue {
  ready: boolean;
  session: SessionUser | null;
  cases: LegalCase[];
  appointments: Appointment[];
  users: User[];
  categories: typeof CATEGORIES;
  login: (userId: string) => void;
  logout: () => void;
  createCase: (input: CreateCaseInput) => LegalCase;
  validateCase: (
    caseId: string,
    categoryId: LegalCategoryId,
    advisorId: string,
  ) => void;
  assignIntern: (
    caseId: string,
    internId: string,
    appointment: Omit<Appointment, "id" | "caseId" | "status">,
  ) => void;
  addNote: (caseId: string, content: string) => void;
  updateStatus: (caseId: string, status: CaseStatus) => void;
  getCase: (id: string) => LegalCase | undefined;
  getAppointmentForCase: (caseId: string) => Appointment | undefined;
  visibleCases: LegalCase[];
}

const AppContext = createContext<AppContextValue | null>(null);

function loadState(): PersistedState {
  if (typeof window === "undefined") {
    return { cases: SEED_CASES, appointments: SEED_APPOINTMENTS, session: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { cases: SEED_CASES, appointments: SEED_APPOINTMENTS, session: null };
    }
    return JSON.parse(raw) as PersistedState;
  } catch {
    return { cases: SEED_CASES, appointments: SEED_APPOINTMENTS, session: null };
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [cases, setCases] = useState<LegalCase[]>(SEED_CASES);
  const [appointments, setAppointments] =
    useState<Appointment[]>(SEED_APPOINTMENTS);
  const [session, setSession] = useState<SessionUser | null>(null);

  useEffect(() => {
    const state = loadState();
    setCases(state.cases);
    setAppointments(state.appointments);
    setSession(state.session);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const payload: PersistedState = { cases, appointments, session };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [ready, cases, appointments, session]);

  const login = useCallback((userId: string) => {
    const user = USERS.find((u) => u.id === userId);
    if (!user) return;
    setSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedState;
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ ...parsed, session: null }),
        );
      } else {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            cases: SEED_CASES,
            appointments: SEED_APPOINTMENTS,
            session: null,
          }),
        );
      }
    } catch {
      /* ignore */
    }
  }, []);


  const createCase = useCallback(
    (input: CreateCaseInput): LegalCase => {
      const classification = classifyCase(
        `${input.title} ${input.description}`,
      );
      const now = new Date().toISOString();
      const legalCase: LegalCase = {
        id: `case-${crypto.randomUUID().slice(0, 8)}`,
        folio: nextFolio(cases.length + 20),
        title: input.title,
        description: input.description,
        consultanteId: session?.role === "consultante" ? session.id : "cons-guest",
        consultanteName: input.consultanteName,
        consultanteEmail: input.consultanteEmail,
        consultantePhone: input.consultantePhone,
        proposedCategoryId: classification.categoryId,
        classificationConfidence: classification.confidence,
        classificationRationale: classification.rationale,
        status: "pendiente_validacion",
        notes: [],
        createdAt: now,
        updatedAt: now,
      };
      setCases((prev) => [legalCase, ...prev]);
      return legalCase;
    },
    [cases.length, session],
  );

  const validateCase = useCallback(
    (caseId: string, categoryId: LegalCategoryId, advisorId: string) => {
      const advisor = USERS.find((u) => u.id === advisorId);
      setCases((prev) =>
        prev.map((c) =>
          c.id === caseId
            ? {
                ...c,
                confirmedCategoryId: categoryId,
                advisorId,
                advisorName: advisor?.name,
                status: "asignado_asesor" as CaseStatus,
                updatedAt: new Date().toISOString(),
              }
            : c,
        ),
      );
    },
    [],
  );

  const assignIntern = useCallback(
    (
      caseId: string,
      internId: string,
      appointment: Omit<Appointment, "id" | "caseId" | "status">,
    ) => {
      const intern = USERS.find((u) => u.id === internId);
      const aptId = `apt-${crypto.randomUUID().slice(0, 8)}`;
      setAppointments((prev) => [
        {
          id: aptId,
          caseId,
          status: "programada",
          ...appointment,
        },
        ...prev,
      ]);
      setCases((prev) =>
        prev.map((c) =>
          c.id === caseId
            ? {
                ...c,
                internId,
                internName: intern?.name,
                appointmentId: aptId,
                status: "en_atencion" as CaseStatus,
                updatedAt: new Date().toISOString(),
              }
            : c,
        ),
      );
    },
    [],
  );

  const addNote = useCallback(
    (caseId: string, content: string) => {
      if (!session) return;
      setCases((prev) =>
        prev.map((c) =>
          c.id === caseId
            ? {
                ...c,
                notes: [
                  {
                    id: `note-${crypto.randomUUID().slice(0, 8)}`,
                    authorId: session.id,
                    authorName: session.name,
                    content,
                    createdAt: new Date().toISOString(),
                  },
                  ...c.notes,
                ],
                updatedAt: new Date().toISOString(),
              }
            : c,
        ),
      );
    },
    [session],
  );

  const updateStatus = useCallback((caseId: string, status: CaseStatus) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? { ...c, status, updatedAt: new Date().toISOString() }
          : c,
      ),
    );
  }, []);

  const getCase = useCallback(
    (id: string) => cases.find((c) => c.id === id),
    [cases],
  );

  const getAppointmentForCase = useCallback(
    (caseId: string) => appointments.find((a) => a.caseId === caseId),
    [appointments],
  );

  const visibleCases = useMemo(() => {
    if (!session) return [];
    switch (session.role) {
      case "consultante":
        return cases.filter(
          (c) =>
            c.consultanteId === session.id ||
            c.consultanteEmail === session.email,
        );
      case "asesor":
        return cases.filter(
          (c) =>
            c.advisorId === session.id ||
            c.status === "pendiente_validacion" ||
            (!c.advisorId && c.status === "asignado_asesor"),
        );
      case "practicante":
        return cases.filter((c) => c.internId === session.id);
      case "administrativo":
      default:
        return cases;
    }
  }, [cases, session]);

  const value: AppContextValue = {
    ready,
    session,
    cases,
    appointments,
    users: USERS,
    categories: CATEGORIES,
    login,
    logout,
    createCase,
    validateCase,
    assignIntern,
    addNote,
    updateStatus,
    getCase,
    getAppointmentForCase,
    visibleCases,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
