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

import { obtenerUsuario } from "./users/users.service";

import { createCaseInFirestore, subscribeCases } from "./cases";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { getFirebaseAuth } from "./firebase";

import { CATEGORIES, SEED_APPOINTMENTS } from "./data";
import { obtenerUsuariosAutorizados } from "./users/users.service";
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
  consultanteDocument: string;
  consultanteEmail: string;
  consultanteAddress: string;
  consultanteStratum: string;
  consultantePhone: string;
}

interface AppContextValue {
  ready: boolean;
  session: SessionUser | null;
  appointments: Appointment[];
  users: User[];
  categories: typeof CATEGORIES;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  createCase: (input: CreateCaseInput) => Promise<LegalCase>;
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [appointments, setAppointments] =
    useState<Appointment[]>(SEED_APPOINTMENTS);
  const [session, setSession] = useState<SessionUser | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const auth = getFirebaseAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = await obtenerUsuario(user.uid);

        setSession({
          id: user.uid,
          name: userData?.name || "Usuario",
          email: user.email || "",
          role: userData?.role || "consultante",
        });
      } else {
        setSession(null);
      }

      setReady(true);
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    if (!session) return;

    async function loadUsers() {
      const usuarios = await obtenerUsuariosAutorizados();

      setUsers(usuarios);
    }

    loadUsers();
  }, [session]);

  useEffect(() => {
    if (!session) return;

    const unsubscribeCases = subscribeCases(
      session.id,
      session.role,
      (firebaseCases) => {
        setCases(firebaseCases);
      },
      (error) => {
        console.error("Error cargando casos:", error);
      },
    );

    return () => {
      unsubscribeCases();
    };
  }, [session]);

  useEffect(() => {
    if (!ready) return;

    const payload: PersistedState = {
      cases,
      appointments,
      session,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [ready, appointments, session]);

  const login = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();

    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const logout = useCallback(async () => {
    const auth = getFirebaseAuth();

    await signOut(auth);

    setSession(null);

    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const asignarAsesorAutomatico = (categoryId: LegalCategoryId) => {
    const asesores = users.filter(
      (u) => u.role === "asesor" && u.category === categoryId,
    );

    if (asesores.length === 0) {
      return null;
    }

    return asesores[Math.floor(Math.random() * asesores.length)];
  };

  const asignarPracticanteAutomatico = () => {
    const practicantes = users
      .filter((u) => u.role === "practicante")
      .filter((u) => (u.activeCases ?? 0) < 10);

    if (practicantes.length === 0) {
      return null;
    }

    return practicantes.sort(
      (a, b) => (a.activeCases ?? 0) - (b.activeCases ?? 0),
    )[0];
  };

  const createCase = useCallback(
    async (input: CreateCaseInput): Promise<LegalCase> => {
      const classification = classifyCase(
        `${input.title} ${input.description}`,
      );

      const asesor = asignarAsesorAutomatico(classification.categoryId);

      const practicante = asignarPracticanteAutomatico();

      const legalCase: Omit<LegalCase, "id" | "createdAt" | "updatedAt"> = {
        folio: nextFolio(cases.length + 20),

        title: input.title,
        description: input.description,

        consultanteId:
          session?.role === "consultante" ? session.id : "cons-guest",

        consultanteName: input.consultanteName,
        consultanteEmail: input.consultanteEmail,
        consultantePhone: input.consultantePhone,

        proposedCategoryId: classification.categoryId,

        confirmedCategoryId: classification.categoryId,

        classificationConfidence: classification.confidence,

        classificationRationale: classification.rationale,

        advisorId: asesor?.id,
        advisorName: asesor?.name,

        internId: practicante?.id,
        internName: practicante?.name,

        status: asesor ? "asignado_asesor" : "pendiente_validacion",
        notes: [],
      };
      const id = await createCaseInFirestore(legalCase);

      return {
        id,
        ...legalCase,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    [cases.length, session],
  );

  const validateCase = useCallback(
    (caseId: string, categoryId: LegalCategoryId, advisorId: string) => {
      const advisor = users.find((u) => u.id === advisorId);
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
    [users],
  );

  const assignIntern = useCallback(
    (
      caseId: string,
      internId: string,
      appointment: Omit<Appointment, "id" | "caseId" | "status">,
    ) => {
      const intern = users.find((u) => u.id === internId);
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
    [users],
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
        return cases.filter((c) => c.advisorId === session.id);
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
    users,
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
