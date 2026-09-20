# Asistente Dental Digital Inteligente (ADDI)

MVP en modo independiente (Fase 1) del asistente dental digital: odontograma, ficha clínica y agenda de atención. Ver `Propuesta_Asistente_Dental_Digital.docx` para el detalle completo de la propuesta.

## Estructura

- `backend/` — API REST en NestJS + TypeORM + PostgreSQL.
- `frontend/` — Aplicación web en Next.js + TypeScript + Tailwind.
- `docker-compose.yml` — PostgreSQL para desarrollo local (puerto host `5433`).
- `docker-compose.prod.yml` — stack completo empaquetado (Postgres + backend + frontend), multiplataforma.

## Desarrollo local (sin Docker para la app)

```bash
# 1. Base de datos
docker compose up -d

# 2. Backend (http://localhost:3000)
cd backend
cp .env.example .env
npm install
npm run start:dev

# 3. Frontend (http://localhost:3000 del frontend, en otro puerto si el backend ya usa 3000)
cd frontend
npm install
npm run dev
```

## Empaquetado MVP (Docker, multiplataforma)

Todo el stack (Postgres + backend + frontend) corre con **un solo comando**, igual en Windows, Mac (Intel o Apple Silicon) y Linux — solo se necesita [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac) o Docker Engine (Linux):

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

- Frontend: http://localhost:3001
- Backend: http://localhost:3000

Para detenerlo: `docker compose -f docker-compose.prod.yml down` (agregar `-v` para borrar también los datos de Postgres).

**Por qué es multiplataforma**: las imágenes se basan en `node:22-alpine` y `postgres:16-alpine`, publicadas oficialmente para `linux/amd64` y `linux/arm64`. Docker Desktop/Engine elige automáticamente la variante correcta según el procesador de cada máquina — no hay nada que compilar ni instalar a mano en el sistema operativo anfitrión. Verificado en este repo construyendo y arrancando las imágenes tanto en `arm64` (nativo) como en `amd64` (emulado con QEMU vía `docker buildx`).

**Para publicar imágenes multi-arquitectura propias** (por ejemplo a Docker Hub, para desplegar en un servidor sin tener que compilar ahí):

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t tu-usuario/addi-backend:latest --push ./backend
docker buildx build --platform linux/amd64,linux/arm64 -t tu-usuario/addi-frontend:latest --push ./frontend \
  --build-arg NEXT_PUBLIC_API_URL=https://tu-backend-publico.example.com
```

**Variables de entorno relevantes** (`docker-compose.prod.yml`):
- `NEXT_PUBLIC_API_URL` — URL del backend tal como la alcanza el **navegador** del usuario (se incrusta en el frontend al momento de compilar). Por defecto `http://localhost:3000`, correcto para correr todo en una sola máquina; para desplegar en un servidor hay que reconstruir el frontend con la URL pública real.
- `DB_SYNCHRONIZE=true` — crea el esquema de base de datos automáticamente al arrancar. Es una solución de MVP/piloto porque el proyecto todavía no tiene un sistema de migraciones de TypeORM; antes de operar con datos clínicos reales hay que reemplazarlo por migraciones versionadas.

## Módulos del backend (MVP)

- `pacientes` — datos del paciente (RUT, nombres, contacto).
- `odontograma` — piezas dentales en notación FDI (11–48, 55–85 dentición temporal) con estado clínico.
- `fichas-clinicas` — antecedentes médicos, alergias, medicamentos.
- `agenda` — citas por paciente (fecha, profesional, estado).
- `periodontograma` — sonda periodontal por voz: sesiones de sondaje y sitios (profundidad, sangrado, recesión) por pieza/zona FDI.

Cada módulo expone CRUD REST estándar; `odontograma`, `fichas-clinicas` y `agenda` además exponen `GET /:recurso/paciente/:pacienteId`.

## Próximos pasos (según la propuesta)

- Fase 2: reportería automatizada (REM/DEIS).
- Fase 3: adaptador HL7 FHIR para interoperabilidad.
- Fase 4: integración con SinetSur (sujeta a convenio con el SSC).
