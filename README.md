# LUBRIPOINT - Sistema Web de Gestión de Inventario, Repuestos y Reparaciones

> **Proyecto de Cátedra - Desarrollo de Software Empresarial (UDB)**  
> **Sistema Desplegado en la Nube:**
> - 🌐 **Frontend (Vercel):** [https://proyecto-de-catedra-des.vercel.app](https://proyecto-de-catedra-des.vercel.app)
> - ⚙️ **Backend API (Render):** [https://proyectodecatedrades.onrender.com/api](https://proyectodecatedrades.onrender.com/api)
> - 📚 **Documentación Swagger / OpenAPI:** [https://proyectodecatedrades.onrender.com/api/docs](https://proyectodecatedrades.onrender.com/api/docs)
> - 📋 **Guía de Despliegue:** [DEPLOY.md](DEPLOY.md) | **Documentos:** [/docs](docs/) | **Mockups:** [/mockups](mockups/)

## 1. Descripción General del Proyecto
Lubripoint es un sistema web integral diseñado para la gestión de inventario, catálogo de repuestos, registro de entradas de stock, procesamiento de salidas por reparaciones (órdenes de trabajo) y generación de reportes financieros y de consumo para un taller mecánico y lubricentro.

El sistema resuelve la problemática de control de inventario reactivo al implementar alertas inteligentes automatizadas de bajo stock parametrizables, garantizando respuestas en catálogo inferiores a 2 segundos y manteniendo la integridad de las existencias mediante transacciones atómicas de base de datos.

---

## 2. Arquitectura y Stack Tecnológico

### Backend
- Framework: NestJS (Node.js) con TypeScript.
- Base de Datos y ORM: PostgreSQL / SQLite administrado mediante TypeORM con soporte para transacciones atómicas (QueryRunner).
- Autenticación y Seguridad: JSON Web Tokens (JWT) mediante Passport.js, protección de rutas mediante Guards personalizados e inmutabilidad de contraseñas con bcrypt.
- Validaciones: Validaciones estrictas con class-validator y class-transformer.
- Documentación API: Documentación interactiva OpenAPI generada con @nestjs/swagger y swagger-ui-express.
- Almacenamiento en la Nube: Integración con la API de Cloudinary para la carga y optimización de imágenes de los repuestos.
- Utilidades y Reportes: date-fns / dayjs para manejo de fechas y librería xlsx para generación de reportes en formato Excel.

### Frontend
- Framework y Empaquetado: React 18 empaquetado con Vite y desarrollado en TypeScript.
- Estilos y UI: Tailwind CSS implementando un sistema de diseño adaptativo en modo oscuro orientado a uso en talleres y dispositivos móviles.
- Iconografía y Modales: lucide-react para iconografía e integración de sweetalert2 para cuadros de diálogo de confirmación.
- Gestión de Estado Servidor: @tanstack/react-query para el manejo asíncrono y caché del estado del servidor.
- Tablas Dinámicas: @tanstack/react-table para ordenamiento y filtrado de datos.
- Formularios: react-hook-form con validaciones estrictas construidas con zod.

---

## 3. Modelo de Datos y Entidades TypeORM

El modelo de datos relacional se compone de seis entidades principales:

1. Usuario: Almacena la información de los usuarios del sistema (nombre, email, password encriptado, rol y estado activo). Soporta tres roles: Administrador, Jefe de Pista y Mecánico.
2. Categoria: Clasifica los repuestos e insumos del taller (ejemplo: Aceite de Motor, Aceite de Caja, Frenos, Suspensión y Dirección, Filtros, Fajas y Accesorios).
3. Repuesto: Contiene el detalle de cada artículo del catálogo. Incluye código, nombre, descripción, costo sin IVA, costo con IVA, precio final de venta, stock actual, umbral mínimo de stock (stockMinimo) e imagen almacenada en la nube.
4. EntradaInventario: Registra los ingresos de mercadería al taller indicando el repuesto, la cantidad recibida, el proveedor, el costo de adquisición y la fecha exacta de ingreso.
5. Orden: Representa las órdenes de trabajo y facturas emitidas. Registra el código correlativo de orden (ejemplo: #000001), datos del vehículo (placa, marca, modelo), datos del cliente (nombre, teléfono), descripción del trabajo o falla, subtotal, descuento, total final y mecánico asignado.
6. DetalleOrden: Mantiene la relación de repuestos utilizados en cada orden de trabajo con su respectiva cantidad, precio unitario y subtotal.

---

## 4. Requisitos Funcionales y Lógica de Negocio

### Gestión de Usuarios y Control de Acceso (RBAC)
El sistema restringe las operaciones de acuerdo a tres roles:
- Administrador: Acceso total al sistema, creación de usuarios administradores, gestión del catálogo, ajustes de inventario y consulta de reportes.
- Jefe de Pista: Gestión del catálogo, registro de entradas de inventario y emisión de órdenes de trabajo.
- Mecánico: Consulta del catálogo de repuestos y registro de órdenes asociadas a servicios.

### Alertas Inteligentes de Stock
Sustituye los sistemas reactivos tradicionales notificando automáticamente en pantalla y en el tablero principal cuando las existencias de un repuesto alcanzan o caen por debajo de su umbral mínimo parametrizado (stockMinimo).

### Transacciones Atómicas
Todas las operaciones que modifican inventario utilizan transacciones explícitas de TypeORM:
- Entradas de Inventario: El incremento de stock y el registro del proveedor se ejecutan dentro de una misma transacción.
- Salidas por Orden de Trabajo: Se verifica la disponibilidad previa de cada repuesto. Al confirmar la orden, se descuenta el stock de cada artículo de forma atómica y se genera el registro de la orden. Si un repuesto no cuenta con existencias suficientes, la transacción completa realiza rollback impidiendo inconsistencias.

---

## 5. Pantallas y Vistas del Frontend

1. Login: Formulario de autenticación seguro basado en credenciales.
2. Dashboard General: Panel de control central con tarjetas de resumen financiero (total facturado, total descuentos, órdenes emitidas), alertas de bajo stock, accesos rápidos y listado de repuestos más utilizados.
3. Facturación / Nueva Orden: Interfaz dividida que permite buscar repuestos del catálogo, agregarlos a un carrito lateral con ajuste de cantidades, ingresar datos del vehículo y cliente, aplicar descuentos y emitir la orden con vista de comprobante imprimible.
4. Gestión de Categorías y Agregar Producto: Formularios para la administración de categorías del taller y registro de nuevos artículos con carga de imágenes.
5. Historial de Ventas: Tabla de consulta de órdenes emitidas con opción de re-impresión de comprobante y descarga de reporte en Excel.
6. Inventario / Consulta de Stock: Tabla principal de existencias con buscador en tiempo real por código o nombre, identificadores visuales por color de estado de stock, modal para registro de entradas de mercadería y exportación a Excel.
7. Perfiles (Configuración y Equipo): Panel para la edición del perfil activo y administración del equipo de usuarios registrados.

---

## 6. Instrucciones de Instalación y Ejecución

### Requisitos Previos
- Node.js versión 18 o superior.
- Gestor de paquetes npm.

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/EfraPayon777/ProyectoDeCatedraDES.git
cd ProyetoDeCatedraDES
```

### Paso 2: Iniciar el Servidor Backend
```bash
cd backend
npm install
npm run start:dev
```
- La API REST se ejecutará en: http://localhost:3000/api
- La documentación OpenAPI/Swagger estará disponible en: http://localhost:3000/api/docs

### Paso 3: Iniciar el Servidor Frontend
```bash
cd ../frontend
npm install
npm run dev
```
- La aplicación frontend estará disponible en: http://localhost:5173

---

## 7. Credenciales Predeterminadas de Prueba

Al iniciar el backend por primera vez, el sistema siembra automáticamente los datos iniciales de prueba:
- Correo Electrónico: lubripointsv@gmail.com
- Contraseña: admin123
- Rol: Administrador

---

## 8. Documentación de la API REST

Los principales endpoints expuestos por el backend son:

- POST /api/auth/login: Iniciar sesión y obtener token JWT.
- POST /api/auth/register: Registrar usuario administrador.
- GET /api/auth/profile: Obtener datos del usuario autenticado.
- PUT /api/auth/profile: Actualizar datos del perfil activo.
- GET /api/auth/admins: Listar administradores registrados.
- GET /api/categorias: Listar categorías.
- POST /api/categorias: Crear nueva categoría.
- DELETE /api/categorias/:id: Eliminar categoría.
- GET /api/repuestos: Listar catálogo con filtros de búsqueda.
- GET /api/repuestos/alertas-stock: Obtener repuestos con bajo stock.
- POST /api/repuestos: Crear nuevo repuesto.
- POST /api/repuestos/upload-image: Subir imagen a Cloudinary.
- PUT /api/repuestos/:id: Actualizar repuesto.
- DELETE /api/repuestos/:id: Eliminar repuesto.
- GET /api/entradas: Historial de entradas de inventario.
- POST /api/entradas: Registrar nueva entrada e incrementar stock.
- GET /api/ordenes: Listar historial de órdenes de trabajo.
- GET /api/ordenes/:id: Obtener detalle de una orden.
- POST /api/ordenes: Emitir orden de trabajo y descontar stock.
- GET /api/reportes/dashboard: Obtener resumen financiero y métricas.
- GET /api/reportes/piezas-mas-usadas: Obtener listado de piezas más consumidas.
- GET /api/reportes/exportar-inventario: Descargar archivo Excel del inventario.
- GET /api/reportes/exportar-ventas: Descargar archivo Excel del historial de ventas.

---

## 9. Declaración de Uso de Inteligencia Artificial (IA)

En cumplimiento con el **Numeral 3 de los Lineamientos del Proyecto de Cátedra (UDB)**:

> *"Declaramos que el equipo de desarrollo utilizó herramientas de Inteligencia Artificial (asistentes de código basados en modelos LLM) como apoyo para la comprensión de conceptos arquitectónicos, depuración de errores de configuración en TypeScript/Vite, optimización de transacciones atómicas con TypeORM y asistencia en la redacción técnica. Todo el código generado fue minuciosamente analizado, adaptado, integrado y probado por los integrantes del equipo para asegurar el cumplimiento de la lógica de negocio requerida por el taller Lubripoint."*

### Prompt Muestra Utilizado:
```text
"Actúa como un arquitecto de software empresarial. Ayúdame a diseñar una arquitectura limpia en NestJS con TypeORM para un sistema de inventario y órdenes de trabajo automotriz. Necesito que al momento de emitir una orden de trabajo se valide el stock disponible de cada repuesto y se descuenten las existencias dentro de una transacción atómica (QueryRunner) con rollback automático en caso de falta de stock o error."
```
