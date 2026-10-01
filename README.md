# LUBRIPOINT - Sistema Web de Gestión de Inventario, Repuestos y Reparaciones

> **Universidad Don Bosco - Facultad de Ingeniería**  
> **Escuela de Computación | Desarrollo de Software Empresarial**  
> 
> **Enlaces del Sistema en Producción:**  
> - Frontend (Vercel): [https://proyecto-de-catedra-des.vercel.app](https://proyecto-de-catedra-des.vercel.app)  
> - Backend API (Render): [https://proyectodecatedrades.onrender.com/api](https://proyectodecatedrades.onrender.com/api)  
> - Documentación Swagger / OpenAPI: [https://proyectodecatedrades.onrender.com/api/docs](https://proyectodecatedrades.onrender.com/api/docs)  
> - Recursos del Proyecto: [DEPLOY.md](DEPLOY.md) | [Carpeta /docs](docs/) | [Carpeta /mockups](mockups/)

---

## 1. Descripción General del Proyecto

Lubripoint es un sistema web desarrollado para la administración de inventario, catálogo de repuestos, registro de compras y entradas de stock, emisión de órdenes de trabajo con salida automática de materiales y generación de reportes financieros y de existencias para un taller mecánico y lubricentro automotriz.

El sistema solventa la falta de control de inventario en tiempo real mediante un mecanismo de alertas parametrizables de bajo stock y asegura la consistencia de las existencias mediante transacciones de base de datos que ejecutan rollback ante cualquier eventualidad de stock insuficiente.

---

## 2. Arquitectura y Stack Tecnológico

### Backend
- Framework: NestJS (Node.js) con TypeScript.
- Base de Datos y ORM: PostgreSQL administrado con TypeORM y soporte de transacciones mediante QueryRunner.
- Autenticación y Seguridad: JSON Web Tokens (JWT) con Passport.js, control de acceso basado en roles (Guards) y encriptación de contraseñas con bcrypt.
- Validaciones: Esquemas de validación con class-validator y class-transformer.
- Documentación API: Especificación OpenAPI interactiva generada con Swagger.
- Almacenamiento Multimedia: Integración con Cloudinary y soporte de respaldo para almacenamiento de fotografías de repuestos.
- Reportes: Generación y exportación de archivos en formato Excel mediante la librería xlsx.

### Frontend
- Framework y Empaquetado: React 18 desarrollado con TypeScript y empaquetado con Vite.
- Estilos y Maquetación: Tailwind CSS con soporte para interfaz en tema oscuro, adaptada a entornos de taller.
- Iconografía: Iconos vectoriales mediante lucide-react y alertas interactivas con SweetAlert2.
- Gestión de Estado Servidor: Manejo de peticiones asíncronas y caché con TanStack React Query.
- Formularios: Formularios estructurados con validaciones en cliente.

---

## 3. Modelo de Datos y Entidades

El modelo relacional del sistema está compuesto por las siguientes entidades principales:

1. Usuario: Datos de cuenta (nombre, correo electrónico, contraseña encriptada, rol y estado de activación). Soporta los roles Administrador, Jefe de Pista y Mecánico.
2. Categoria: Clasificación de repuestos e insumos (por ejemplo: Aceite de Motor, Aceite de Caja, Frenos, Suspensión y Dirección, Filtros, Fajas y Accesorios).
3. Repuesto: Ficha técnica de cada artículo del catálogo. Almacena código SKU, nombre, descripción, costo de adquisición sin IVA, costo con IVA, precio de venta, stock actual, stock mínimo para alertas y enlace a la imagen del producto.
4. EntradaInventario: Registro de recepciones de mercadería indicando repuesto, cantidad recibida, proveedor, costo unitario y fecha de ingreso.
5. Orden: Órdenes de trabajo y comprobantes de venta emitidos. Contiene código correlativo, datos del cliente (nombre, teléfono), datos del vehículo (placa, marca, modelo), descripción de la falla o servicio, subtotal, descuento, monto total y mecánico asignado.
6. DetalleOrden: Detalle de repuestos asociados a cada orden con sus cantidades, precios unitarios y subtotales.

---

## 4. Requisitos Funcionales y Lógica de Negocio

### Control de Acceso Basado en Roles (RBAC)
- Administrador: Acceso total al sistema, administración de usuarios, ajustes de catálogo, control de stock y consulta de métricas financieras.
- Jefe de Pista: Gestión de catálogo, registro de entradas de inventario y generación de órdenes de trabajo.
- Mecánico: Consulta del catálogo de repuestos y visualización de órdenes de trabajo.

### Alertas de Inventario
Notificación visual automática en el tablero principal y en la tabla de inventario cuando las existencias de un repuesto alcanzan o caen por debajo de su umbral mínimo configurado.

### Manejo Transaccional
- Entradas de Inventario: La actualización de existencias y el registro histórico del proveedor se ejecutan dentro de la misma transacción.
- Órdenes de Trabajo: Antes de confirmar la venta, se valida la disponibilidad física de cada repuesto. Durante la confirmación se descuentan las cantidades de forma atómica. Si algún artículo no cuenta con suficiente stock, la transacción realiza rollback completo para evitar descuadres en el inventario.

---

## 5. Módulos y Pantallas del Sistema

1. Login: Autenticación por correo y contraseña con retorno de token JWT.
2. Dashboard Principal: Resumen financiero (total facturado, descuentos otorgados y total de órdenes emitidas), alertas de bajo stock, accesos rápidos y piezas más consumidas.
3. Facturación / Nueva Venta: Búsqueda interactiva de repuestos, carrito lateral con cálculo automático de importes, captura de datos del cliente/vehículo y emisión de comprobante de venta.
4. Inventario / Stock: Consulta general de existencias, buscador en tiempo real, registro de nuevos productos, edición de repuestos existentes, registro de entradas de mercadería y descarga de reporte Excel.
5. Gestión de Categorías: Mantenimiento completo de clasificaciones del taller (creación, edición de nombre y eliminación).
6. Historial de Ventas: Tabla de órdenes emitidas con opción de reimpresión de comprobante y exportación de transacciones a Excel.
7. Perfiles y Equipo: Administración del perfil del usuario en sesión y consulta del personal registrado.

---

## 6. Instalación y Ejecución en Entorno Local

### Requisitos Previos
- Node.js versión 18 o superior.
- Gestor de paquetes npm.

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/EfraPayon777/ProyectoDeCatedraDES.git
cd ProyectoDeCatedraDES
```

### Paso 2: Iniciar el Backend
```bash
cd backend
npm install
npm run start:dev
```
- API REST disponible en: http://localhost:3000/api
- Documentación Swagger disponible en: http://localhost:3000/api/docs

### Paso 3: Iniciar el Frontend
```bash
cd ../frontend
npm install
npm run dev
```
- Aplicación disponible en: http://localhost:5173

---

## 7. Credenciales de Prueba

Al inicializar el sistema por primera vez, se generan datos de demostración para evaluación:
- Correo Electrónico: lubripointsv@gmail.com
- Contraseña: admin123
- Rol Asignado: Administrador

---

## 8. Endpoints de la API REST

Los principales recursos provistos por el backend son:

- POST /api/auth/login: Autenticación de usuarios y entrega de token JWT.
- POST /api/auth/register: Registro de nuevos usuarios con rol administrativo.
- GET /api/auth/profile: Consulta de datos del usuario autenticado.
- PUT /api/auth/profile: Modificación de información del perfil activo.
- GET /api/auth/admins: Listado del equipo de administradores registrados.
- GET /api/categorias: Consulta general de categorías.
- POST /api/categorias: Registro de una nueva categoría.
- PUT /api/categorias/:id: Actualización del nombre de una categoría existente.
- DELETE /api/categorias/:id: Eliminación de categoría.
- GET /api/repuestos: Consulta de catálogo con parámetros de búsqueda y filtro por categoría.
- GET /api/repuestos/alertas-stock: Consulta de artículos con existencias por debajo del umbral mínimo.
- POST /api/repuestos: Registro de un nuevo repuesto.
- PUT /api/repuestos/:id: Actualización de datos de un repuesto existente.
- DELETE /api/repuestos/:id: Eliminación de un repuesto del catálogo.
- POST /api/repuestos/upload-image: Carga de imagen del producto.
- GET /api/entradas: Consulta histórica de entradas de inventario.
- POST /api/entradas: Registro de entrada de mercadería con incremento de stock.
- GET /api/ordenes: Consulta del historial de órdenes de trabajo.
- GET /api/ordenes/:id: Consulta del detalle de una orden de trabajo.
- POST /api/ordenes: Emisión de orden con descuento automático de existencias.
- GET /api/reportes/dashboard: Métricas consolidadas del panel de control.
- GET /api/reportes/piezas-mas-usadas: Estadísticas de repuestos más utilizados.
- GET /api/reportes/exportar-inventario: Descarga de archivo Excel con el inventario completo.
- GET /api/reportes/exportar-ventas: Descarga de archivo Excel con el historial de ventas.

---

## 9. Declaración de Uso de Inteligencia Artificial

En cumplimiento con los lineamientos de la asignatura sobre el uso de herramientas de inteligencia artificial:

> "Declaramos que el equipo de trabajo utilizó herramientas de inteligencia artificial como apoyo para la consulta de conceptos técnicos, depuración de errores de configuración en TypeScript y revisión de la redacción técnica del proyecto. El diseño de la arquitectura, la estructura de la base de datos relacional y la implementación de la lógica de negocio fueron desarrollados, revisados y validados en su totalidad por los integrantes del equipo."

### Prompt de Referencia Utilizado:
```text
"Ayúdame a diseñar la arquitectura en NestJS con TypeORM para un sistema de inventario y órdenes de trabajo automotriz. Se requiere que al emitir una orden de trabajo se valide el stock disponible de cada repuesto y se descuenten las existencias dentro de una transacción con rollback automático si no hay suficiente stock."
```
