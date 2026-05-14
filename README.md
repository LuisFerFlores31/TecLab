# 🔬 Laboratory Management System | Tec de Monterrey

<div align="center">
  <img src="https://img.shields.io/badge/Status-Completed-green?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Team-Los%20Makuins-blue?style=for-the-badge" alt="Team">
  <img src="https://img.shields.io/badge/Academic%20Level-6th%20Semester-orange?style=for-the-badge" alt="Semester">
</div>

## 📌 Descripción del Proyecto
Este sistema fue diseñado para optimizar y digitalizar el control de inventarios, préstamos y mantenimiento de los laboratorios del **Tecnológico de Monterrey**. El objetivo principal es reducir la fricción administrativa y asegurar que los recursos académicos estén siempre disponibles y en buen estado para la comunidad estudiantil.

## 🚀 Características Principales
* **Gestión de Inventario:** Control detallado de equipo, reactivos y herramientas con seguimiento de existencias.
* **Sistema de Préstamos:** Registro automatizado de salida y entrada de materiales para evitar pérdidas.
* **Reportes en Tiempo Real:** Visualización del estado actual y disponibilidad del laboratorio.
* **Roles de Usuario:** Acceso diferenciado para administradores (profesores/técnicos) 



## 👥 El Equipo: "Los Makuins"
Este proyecto fue desarrollado como parte de una colaboración académica por:

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
| Coordinador     | coordinador@teclab.mx      | Admin1234!      |
| Encargado Bio   | bio@teclab.mx              | Encargado1234!  |

## Commits
- `feat:` nueva funcionalidad
- `fix:` corrección de bug
- `refactor:` reestructuración
- `chore:` configuración/dependencias
- `db:` cambios de schema/migraciones
- `docs:` documentación
