import type { Permission } from '../context/permissions';

export type UserRole = 'Administrador' | 'Jefe de Pista' | 'Mecánico';

export interface User {
  id: number;
  nombre: string;
  email: string;
  // Puede contener un rol retirado (p. ej. "Empleado") en usuarios antiguos: sin permisos hasta reasignarlo.
  rol: UserRole | string;
  activo: boolean;
  /** Permisos efectivos calculados por el backend según el rol. */
  permisos?: Permission[];
  fechaRegistro: string;
}

export interface Categoria {
  id: number;
  nombre: string;
}

export interface Repuesto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  // El backend los calcula con IVA 13% si se registran en 0/vacío. En PostgreSQL llegan como string decimal.
  costoSinIva: number | string | null;
  costoConIva: number | string | null;
  precioFinal: number;
  stockActual: number;
  stockMinimo: number;
  imagenUrl?: string;
  categoriaId: number;
  categoria?: Categoria;
}

export interface DetalleOrden {
  id?: number;
  repuestoId: number;
  repuesto?: Repuesto;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Orden {
  id: number;
  codigoOrden: string;
  placa: string;
  marca: string;
  modelo: string;
  clienteNombre: string;
  clienteTelefono?: string;
  descripcionFalla?: string;
  subtotal: number;
  descuento: number;
  total: number;
  estado: string;
  fechaEmision: string;
  detalles: DetalleOrden[];
  mecanico?: User;
}

export interface DashboardSummary {
  totalFacturado: number;
  totalDescuentos: number;
  totalOrdenes: number;
  repuestosBajoStock: number;
  totalProductosDistintos: number;
}

export interface EntradaInventario {
  id: number;
  repuestoId: number;
  repuesto?: Repuesto;
  cantidad: number;
  proveedor: string;
  costoAdquisicion: number;
  fechaIngreso: string;
}
