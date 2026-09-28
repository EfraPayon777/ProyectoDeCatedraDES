export type UserRole = 'Administrador' | 'Jefe de Pista' | 'Mecánico';

export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: UserRole;
  activo: boolean;
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
  costoSinIva: number;
  costoConIva: number;
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
