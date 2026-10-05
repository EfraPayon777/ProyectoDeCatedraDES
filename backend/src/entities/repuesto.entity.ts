import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, AfterLoad } from 'typeorm';
import { Categoria } from './categoria.entity';
import { DetalleOrden } from './detalle-orden.entity';
import { EntradaInventario } from './entrada-inventario.entity';
import { resolverCostosIva } from '../repuestos/iva.util';

@Entity('repuestos')
export class Repuesto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  codigo: string;

  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  costoSinIva: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  costoConIva: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioFinal: number;

  @Column({ type: 'int', default: 0 })
  stockActual: number;

  @Column({ type: 'int', default: 5 })
  stockMinimo: number;

  @Column({ type: 'text', nullable: true })
  imagenUrl: string;

  @Column({ nullable: true })
  categoriaId: number;

  @ManyToOne(() => Categoria, (categoria) => categoria.repuestos, { onDelete: 'SET NULL', eager: true })
  @JoinColumn({ name: 'categoriaId' })
  categoria: Categoria;

  @OneToMany(() => DetalleOrden, (detalle) => detalle.repuesto)
  detallesOrden: DetalleOrden[];

  @OneToMany(() => EntradaInventario, (entrada) => entrada.repuesto)
  entradas: EntradaInventario[];

  /**
   * Registros antiguos guardados con costos en 0 (antes del cálculo automático):
   * al consultarlos se devuelven los costos calculados con IVA 13% sin modificar la BD.
   * Se persisten la próxima vez que el repuesto se guarde.
   */
  @AfterLoad()
  completarCostosIva() {
    if (this.costoSinIva === undefined || this.costoConIva === undefined || this.precioFinal === undefined) {
      return; // carga parcial (select de columnas específicas)
    }
    if (Number(this.costoSinIva) > 0 && Number(this.costoConIva) > 0) {
      return;
    }
    const costos = resolverCostosIva(this.costoSinIva, this.costoConIva, this.precioFinal);
    this.costoSinIva = costos.costoSinIva;
    this.costoConIva = costos.costoConIva;
  }
}
