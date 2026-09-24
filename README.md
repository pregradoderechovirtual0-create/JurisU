# JurisU — Consultorio Jurídico Universitario

Plataforma web para gestionar los casos de un consultorio jurídico universitario: registro de solicitudes, clasificación automática de área jurídica, validación administrativa, asignación de asesores y practicantes, agenda de citas y seguimiento hasta el cierre.

Basada en la guía inicial del proyecto (flujo consultante → clasificación → administrativo → asesor → practicante → atención → cierre).

## Cómo ejecutar

```bash
npm install
npm run dev
```

Abre [http://127.0.0.1:3847](http://127.0.0.1:3847).

## Demo por roles

En la pantalla de inicio elige un perfil (sin contraseña; datos en `localStorage` del navegador):

| Rol | Qué puedes hacer |
| --- | --- |
| **Consultante** | Registrar solicitudes, ver estado y citas |
| **Administrativo** | Validar clasificación, asignar asesores, ver categorías y agenda |
| **Asesor jurídico** | Asignar practicante y programar cita |
| **Practicante** | Ver casos asignados y registrar avances |

## Módulos incluidos en este slice

- Gestión de casos y estados del flujo
- Clasificación automática por palabras clave (familia, penal, civil, laboral, administrativo)
- Agenda de citas presenciales y virtuales
- Vista de categorías con carga y equipo
- Panel por rol

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui.
