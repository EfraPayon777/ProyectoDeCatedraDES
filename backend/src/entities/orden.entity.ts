import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Usuario } from './usuario.entity';
import { DetalleOrden } from './detalle-orden.entity';

export enum EstadoOrden {
  PENDIENTE = 'PENDIENTE',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA',
}

@Entity('ordenes')
export class Orden {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  codigoOrden: string;

  @Column()
  placa: string;

  @Column()
  marca: string;

  @Column()
  modelo: string;

  @Column()
  clienteNombre: string;

  @Column({ nullable: true })
  clienteTelefono: string;

  @Column({ type: 'text', nullable: true })
  descripcionFalla: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  descuento: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'varchar', default: EstadoOrden.COMPLETADA })
  estado: EstadoOrden;

  @Column({ nullable: true })
  mecanicoId: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.ordenes, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'mecanicoId' })
  mecanico: Usuario;

  @OneToMany(() => DetalleOrden, (detalle) => detalle.orden, { cascade: true, eager: true })
  detalles: DetalleOrden[];

  @CreateDateColumn()
  fechaEmision: Date;
}
