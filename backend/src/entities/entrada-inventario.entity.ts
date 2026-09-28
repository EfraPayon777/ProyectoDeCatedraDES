import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Repuesto } from './repuesto.entity';

@Entity('entradas_inventario')
export class EntradaInventario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  repuestoId: number;

  @ManyToOne(() => Repuesto, (repuesto) => repuesto.entradas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'repuestoId' })
  repuesto: Repuesto;

  @Column({ type: 'int' })
  cantidad: number;

  @Column()
  proveedor: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  costoAdquisicion: number;

  @CreateDateColumn()
  fechaIngreso: Date;
}
