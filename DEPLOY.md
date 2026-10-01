# Guía de Despliegue en la Nube (Deployment Guide) - LUBRIPOINT

Este documento detalla el procedimiento técnico y la arquitectura empleada para el despliegue del sistema web **LUBRIPOINT** en entornos de producción en la nube, en cumplimiento con los lineamientos de la cátedra de **Desarrollo de Software Empresarial** de la **Universidad Don Bosco (UDB)**.

---

## 1. Arquitectura de Despliegue en la Nube

El sistema adopta una arquitectura desacoplada y escalable basada en la nube:

| Componente | Plataforma Cloud | Tecnología | URL en Producción |
| :--- | :--- | :--- | :--- |
| **Frontend (Cliente Web SPA)** | **Vercel** | React 18 + Vite + Tailwind CSS | [https://proyecto-de-catedra-des.vercel.app](https://proyecto-de-catedra-des.vercel.app) |
| **Backend (API REST)** | **Render** | NestJS (Node.js) + TypeScript | [https://proyectodecatedrades.onrender.com/api](https://proyectodecatedrades.onrender.com/api) |
| **Documentación API** | **Render (Swagger)** | OpenAPI / Swagger UI | [https://proyectodecatedrades.onrender.com/api/docs](https://proyectodecatedrades.onrender.com/api/docs) |
| **Base de Datos Relacional** | **Render PostgreSQL** | PostgreSQL v16 Gestionado | Conexión interna privada SSL |
| **Almacenamiento Multimedia** | **Cloudinary** | Cloud Storage & CDN | Ingesta y optimización de imágenes |

```mermaid
graph LR
    User([Usuario / Taller]) -->|HTTPS| Frontend[Frontend: Vercel]
    Frontend -->|REST API / JWT| Backend[Backend: Render NestJS]
    Backend -->|TypeORM / SSL| DB[(PostgreSQL: Render)]
    Backend -->|Upload API| Cloudinary[(Cloudinary Media)]
```

---

## 2. Despliegue del Backend y Base de Datos (Render)

### 2.1. Creación de la Base de Datos PostgreSQL
1. Ingresar a la consola de [Render](https://dashboard.render.com).
2. Crear un nuevo servicio: **New +** -> **PostgreSQL**.
3. Parámetros configurados:
   - **Name:** `lubripoint-db`
   - **Database:** `lubripoint_db`
   - **Region:** `Oregon (US West)`
   - **Plan:** `Free ($0/mo)`
4. Al crearse, Render genera la cadena de conexión interna (`Internal Database URL`) y externa (`External Database URL`).

### 2.2. Despliegue del Servicio Web NestJS
1. Crear un nuevo servicio: **New +** -> **Web Service**.
2. Conectar el repositorio de GitHub: `EfraPayon777/ProyectoDeCatedraDES`.
3. Parámetros de configuración:
   - **Environment:** `Node`
   - **Branch:** `main`
   - **Region:** `Oregon (US West)` (misma que la BD)
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod`
   - **Plan:** `Free ($0/mo)`
4. Variables de entorno configuradas:
   ```env
   PORT=10000
   DB_TYPE=postgres
   DATABASE_URL=postgresql://yonpa:******@dpg-davd2uk9v7es73fbeacg-a/lubripoint_db
   JWT_SECRET=lubripoint_secret_jwt_2026
   ```

---

## 3. Despliegue del Frontend (Vercel)

### 3.1. Configuración del Proyecto
1. Ingresar a [Vercel](https://vercel.com) e importar el repositorio `EfraPayon777/ProyectoDeCatedraDES`.
2. Parámetros de configuración:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
3. Variables de entorno configuradas:
   ```env
   VITE_API_BASE_URL=https://proyectodecatedrades.onrender.com/api
   ```
4. Archivo [`frontend/vercel.json`](file:///c:/Users/Efrain%20Cortez/Desktop/ProyectoDES/ProyectoDeCatedraDES/frontend/vercel.json):
   Permite el soporte de enrutamiento del lado del cliente (SPA) redirigiendo todas las solicitudes hacia `/index.html` para evitar errores 404 al recargar rutas como `/inventario` o `/ventas`.

---

## 4. Credenciales de Prueba en Producción

El sistema inicializa automáticamente semillas de prueba en la base de datos PostgreSQL:

- **URL de Acceso:** [https://proyecto-de-catedra-des.vercel.app](https://proyecto-de-catedra-des.vercel.app)
- **Usuario Administrador:** `lubripointsv@gmail.com`
- **Contraseña:** `admin123`
- **Rol:** `Administrador`
