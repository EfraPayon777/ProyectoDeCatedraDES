import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Orden } from '../entities/orden.entity';
import { DetalleOrden } from '../entities/detalle-orden.entity';
import { Repuesto } from '../entities/repuesto.entity';

import * as XLSX from 'xlsx';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Orden)
    private ordenRepository: Repository<Orden>,
    @InjectRepository(DetalleOrden)
    private detalleRepository: Repository<DetalleOrden>,
    @InjectRepository(Repuesto)
    private repuestoRepository: Repository<Repuesto>,
  ) {}

  async getDashboardSummary() {
    const ordenes = await this.ordenRepository.find();
    const totalFacturado = ordenes.reduce((acc, o) => acc + Number(o.total), 0);
    const totalDescuentos = ordenes.reduce((acc, o) => acc + Number(o.descuento || 0), 0);
    const totalOrdenes = ordenes.length;

    const repuestosBajoStock = await this.repuestoRepository.createQueryBuilder('r')
      .where('r.stockActual <= r.stockMinimo')
      .getCount();

    const totalProductosDistintos = await this.repuestoRepository.count();

    return {
      totalFacturado: Number(totalFacturado.toFixed(2)),
      totalDescuentos: Number(totalDescuentos.toFixed(2)),
      totalOrdenes,
      repuestosBajoStock,
      totalProductosDistintos,
    };
  }

  async getPiezasMasUtilizadas() {
    return this.detalleRepository.createQueryBuilder('detalle')
      .select('repuesto.id', 'repuestoId')
      .addSelect('repuesto.nombre', 'nombre')
      .addSelect('repuesto.codigo', 'codigo')
      .addSelect('SUM(detalle.cantidad)', 'totalCantidad')
      .addSelect('SUM(detalle.subtotal)', 'totalRecaudado')
      .innerJoin('detalle.repuesto', 'repuesto')
      .groupBy('repuesto.id')
      .addGroupBy('repuesto.nombre')
      .addGroupBy('repuesto.codigo')
      .orderBy('SUM(detalle.cantidad)', 'DESC') // PostgreSQL no resuelve el alias camelCase sin comillas
      .limit(10)
      .getRawMany();
  }

  async exportarInventarioExcelBuffer(): Promise<Buffer> {
    const repuestos = await this.repuestoRepository.find({ relations: ['categoria'] });

    const data = repuestos.map((r) => ({
      ID: r.id,
      Código: r.codigo,
      Nombre: r.nombre,
      Descripción: r.descripcion || '',
      Categoría: r.categoria ? r.categoria.nombre : 'Sin categoría',
      'Costo sin IVA ($)': Number(r.costoSinIva),
      'Costo con IVA ($)': Number(r.costoConIva),
      'Precio Venta ($)': Number(r.precioFinal),
      'Stock Actual': r.stockActual,
      'Stock Mínimo': r.stockMinimo,
      Estado: r.stockActual <= 0 ? 'AGOTADO' : r.stockActual <= r.stockMinimo ? 'BAJO STOCK' : 'OK',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async exportarOrdenesExcelBuffer(): Promise<Buffer> {
    const ordenes = await this.ordenRepository.find({ order: { id: 'DESC' } });

    const data = ordenes.map((o) => ({
      'ID Venta': o.codigoOrden,
      'Fecha y Hora': new Date(o.fechaEmision).toLocaleString('es-SV'),
      Cliente: o.clienteNombre,
      Teléfono: o.clienteTelefono || '---',
      Vehículo: `${o.marca} ${o.modelo} (${o.placa})`,
      'Subtotal ($)': Number(o.subtotal),
      'Descuento ($)': Number(o.descuento),
      'Total ($)': Number(o.total),
      Estado: o.estado,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial Ventas');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
