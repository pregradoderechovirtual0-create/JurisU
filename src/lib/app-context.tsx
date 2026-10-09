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
import { classifyCase } from "./classify";
import { createCaseInFirestore, subscribeCases } from "./cases";
import {
  addNoteInFirestore,
  assignInternInFirestore,
  updateStatusInFirestore,
  validateCaseInFirestore,
} from "./case-actions";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase";
import { escucharUsuarios, obtenerUsuario } from "./users/users.service";
import { CATEGORIES } from "./data";
import type {
  Appointment,
  CaseStatus,
  LegalCase,
  LegalCategoryId,
  SessionUser,
  User,
} from "./types";

const VALID_ROLES = [
  "consultante",
  "administrativo",
  "asesor",
  "practicante",
] as const;

// La cita se guarda dentro del documento del caso
type CaseWithAppointment = LegalCase & { appointment?: Appointment };

// Lee rol y nombre reales del usuario desde Firestore (colección "users")
async function fetchProfile(
  uid: string,
): Promise<{ role: SessionUser["role"]; name?: string }> {
  try {
    const user = await obtenerUsuario(uid);
    const role = user?.role as string | undefined;
    return {
      role:
        role && (VALID_ROLES as readonly string[]).includes(role)
          ? (role as SessionUser["role"])
          : "consultante",
      name: user?.name,
    };
  } catch (error) {
    console.error("Error leyendo perfil:", error);
    return { role: "consultante" };
  }
}

// Folio único sin depender de cuántos casos puede ver el usuario
function makeFolio() {
  const year = new Date().getFullYear();
  const rand = crypto.randomUUID().replace(/-/g, "").slice(0, 5).toUpperCase();
  return `CJ-${year}-${rand}`;
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
  cases: LegalCase[];
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
    appointment?: Omit<Appointment, "id" | "caseId" | "status">,
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
  const [users, setUsers] = useState<User[]>([]);
  const [session, setSession] = useState<SessionUser | null>(null);

  const sessionId = session?.id;
  const sessionRole = session?.role;
  const sessionEmail = session?.email;

  // 1. Autenticación
  useEffect(() => {
    const auth = getFirebaseAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Refresca el token para que traiga email_verified actualizado
        await user.getIdToken(true);
        const profile = await fetchProfile(user.uid);
        setSession({
          id: user.uid,
          name: profile.name || user.displayName || "Usuario",
          email: user.email || "",
          role: profile.role,
        });
      } else {
        setSession(null);
      }
      setReady(true);
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Casos: cada rol escucha solo lo que le corresponde
  useEffect(() => {
    if (!sessionId || !sessionRole) {
      setCases([]);
      return;
    }
    return subscribeCases(
      { id: sessionId, email: sessionEmail ?? "", role: sessionRole },
      setCases,
      (error) => console.error("Error cargando casos:", error),
    );
  }, [sessionId, sessionRole, sessionEmail]);

  // 3. Usuarios reales (asesores y practicantes), solo para quien los necesita
  useEffect(() => {
    if (
      !sessionId ||
      (sessionRole !== "administrativo" && sessionRole !== "asesor")
    ) {
      setUsers([]);
      return;
    }
    return escucharUsuarios(setUsers, (error) =>
      console.error("Error cargando usuarios:", error),
    );
  }, [sessionId, sessionRole]);

  // Las citas viven dentro de cada caso
  const appointments = useMemo(
    () =>
      (cases as CaseWithAppointment[]).flatMap((c) =>
        c.appointment ? [c.appointment] : [],
      ),
    [cases],
  );

  const login = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const user = credential.user;
    const profile = await fetchProfile(user.uid);

    setSession({
      id: user.uid,
      name: profile.name || user.displayName || "Usuario",
      email: user.email || email,
      role: profile.role,
    });
  }, []);

  const logout = useCallback(async () => {
    await signOut(getFirebaseAuth());
    setSession(null);
  }, []);

  const asignarAsesorAutomatico = (
    categoryId: LegalCategoryId,
  ): User | null => {
    const asesores = users.filter(
      (u) =>
        u.role === "asesor" &&
        (!u.categoryIds || u.categoryIds.includes(categoryId)),
    );

    if (asesores.length === 0) {
      return null;
    }

    const asesoresConCarga = asesores.map((asesor) => {
      const casosActivos = cases.filter(
        (caso) => caso.advisorId === asesor.id && caso.status !== "cerrado",
      ).length;

      return {
        asesor,
        casosActivos,
      };
    });

    asesoresConCarga.sort((a, b) => a.casosActivos - b.casosActivos);

    return asesoresConCarga[0].asesor;
  };

  const createCase = useCallback(
    async (input: CreateCaseInput): Promise<LegalCase> => {
      const classification = classifyCase(
        `${input.title} ${input.description}`,
      );

      const asesor = asignarAsesorAutomatico(classification.categoryId);

      const legalCase: Omit<LegalCase, "id" | "createdAt" | "updatedAt"> = {
        folio: makeFolio(),
        title: input.title,
        description: input.description,

        consultanteId:
          session?.role === "consultante" ? session.id : "cons-guest",

        consultanteName: input.consultanteName,
        consultanteDocument: input.consultanteDocument,
        consultanteAddress: input.consultanteAddress,
        consultanteStratum: input.consultanteStratum,
        consultanteEmail: input.consultanteEmail.trim().toLowerCase(),
        consultantePhone: input.consultantePhone,

        proposedCategoryId: classification.categoryId,
        confirmedCategoryId: classification.categoryId,

        classificationConfidence: classification.confidence,

        classificationRationale: classification.rationale,

        advisorId: asesor?.id,
        advisorName: asesor?.name,

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cases, users, session],
  );

  const validateCase = useCallback(
    (caseId: string, categoryId: LegalCategoryId, advisorId: string) => {
      const advisor = users.find((u) => u.id === advisorId);
      validateCaseInFirestore(
        caseId,
        categoryId,
        advisorId,
        advisor?.name,
      ).catch((e) => console.error("Error validando caso:", e));
    },
    [users],
  );

  const assignIntern = useCallback(
    (
      caseId: string,
      internId: string,
      appointment?: Omit<Appointment, "id" | "caseId" | "status">,
    ) => {
      const intern = users.find((u) => u.id === internId);
      const fullAppointment: Appointment | null = appointment
        ? {
            id: `apt-${crypto.randomUUID().slice(0, 8)}`,
            caseId,
            status: "programada",
            ...appointment,
          }
        : null;
      assignInternInFirestore(
        caseId,
        internId,
        intern?.name,
        fullAppointment,
      ).catch((e) => console.error("Error asignando practicante:", e));
    },
    [users],
  );

  const addNote = useCallback(
    (caseId: string, content: string) => {
      if (!session) return;
      addNoteInFirestore(caseId, {
        id: `note-${crypto.randomUUID().slice(0, 8)}`,
        authorId: session.id,
        authorName: session.name,
        content,
        createdAt: new Date().toISOString(),
      }).catch((e) => console.error("Error guardando nota:", e));
    },
    [session],
  );

  const updateStatus = useCallback((caseId: string, status: CaseStatus) => {
    updateStatusInFirestore(caseId, status).catch((e) =>
      console.error("Error actualizando estado:", e),
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
    const myEmail = session.email.toLowerCase();
    switch (session.role) {
      case "consultante":
        return cases.filter(
          (c) =>
            c.consultanteId === session.id ||
            c.consultanteEmail?.toLowerCase() === myEmail,
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