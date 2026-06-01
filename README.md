# 🔬 Laboratory Management System | Tec de Monterrey

<div align="center">
  <img src="https://img.shields.io/badge/Status-Completed-green?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Team-Los%20Makuins-blue?style=for-the-badge" alt="Team">
  <img src="https://img.shields.io/badge/Academic%20Level-6th%20Semester-orange?style=for-the-badge" alt="Semester">
</div>

<div align="center">
  <img src="frontend/src/assets/hero.png" alt="Vista general del sistema Tec-Lab" width="360">
</div>

## 📌 Descripción del Proyecto
Este sistema fue diseñado para digitalizar el control de inventario de los laboratorios del **Tecnológico de Monterrey**. La plataforma reduce la fricción administrativa y ayuda a mantener la operación de los laboratorios ordenada, trazable y disponible para los Laboratoristas.


## 🧩 Tecnologías del Sistema

### Frontend
<div align="center">
  <img src="https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Vite-8.0.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/React_Router-7.14.1-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" alt="React Router">
  <img src="https://img.shields.io/badge/Recharts-3.8.1-8884D8?style=for-the-badge" alt="Recharts">
  <img src="https://img.shields.io/badge/TanStack_Table-8.21.3-EF4444?style=for-the-badge" alt="TanStack Table">
</div>

### Backend
<div align="center">
  <img src="https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-5.2.1-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/Prisma-5.22.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma">
  <img src="https://img.shields.io/badge/PostgreSQL-16+-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT">
</div>

### Infraestructura y utilidades
<div align="center">
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/Multer-Uploads-4A5568?style=for-the-badge" alt="Multer">
  <img src="https://img.shields.io/badge/Bcrypt-Password_Hashing-8A2BE2?style=for-the-badge" alt="bcryptjs">
  <img src="https://img.shields.io/badge/Node_Cron-Scheduled_Jobs-0F766E?style=for-the-badge" alt="node-cron">
</div>

## 🚀 Características Principales
* **Gestión de inventario:** Control de equipo, reactivos y herramientas con seguimiento de existencias.
* **Exportación de datos:** Descarga de información en formatos útiles para análisis y respaldo.
* **Reportes visuales:** Indicadores y gráficas para consultar el estado actual del laboratorio.
* **Roles de usuario:** Acceso diferenciado para administradores (Coordinadores) y personal autorizado (Laboratoristas).

## Requisitos
- Docker Desktop
- Git

### Primera vez
```bash
docker-compose up --build
```

### Correr seed (primera vez o al resetear BD)
```bash
docker-compose exec backend node src/lib/seed.js
```

### Levantar
```bash
docker-compose up
```

### Apagar
```bash
docker-compose down
```

### Apagar y borrar datos (reset completo)
```bash
docker-compose down -v
```

## URLs
| Servicio  | URL                    |
|-----------|------------------------|
| Frontend  | http://localhost:5173  |
| Backend   | http://localhost:3001  |
| API Health| http://localhost:3001/api/health |

## Credenciales desarrollo
| Usuario         | Email                      | Password        |
|-----------------|----------------------------|-----------------|
| Coordinador     | coordinador@tec.mx      | Admin1234!      |
| Encargado Bio   | bio@tec.mx              | Encargado1234!  |

## Commits
- `feat:` nueva funcionalidad
- `fix:` corrección de bug
- `refactor:` reestructuración
- `chore:` configuración/dependencias
- `db:` cambios de schema/migraciones
- `docs:` documentación
