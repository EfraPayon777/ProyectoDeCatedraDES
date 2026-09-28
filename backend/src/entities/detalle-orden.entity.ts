import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Orden } from './orden.entity';
import { Repuesto } from './repuesto.entity';

@Entity('detalles_orden')
export class DetalleOrden {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ordenId: number;

  @ManyToOne(() => Orden, (orden) => orden.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ordenId' })
  orden: Orden;

  @Column()
  repuestoId: number;

  @ManyToOne(() => Repuesto, (repuesto) => repuesto.detallesOrden, { onDelete: 'RESTRICT', eager: true })
  @JoinColumn({ name: 'repuestoId' })
  repuesto: Repuesto;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioUnitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;
}
