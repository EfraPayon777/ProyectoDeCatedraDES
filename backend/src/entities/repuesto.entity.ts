import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Categoria } from './categoria.entity';
import { DetalleOrden } from './detalle-orden.entity';
import { EntradaInventario } from './entrada-inventario.entity';

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
}
