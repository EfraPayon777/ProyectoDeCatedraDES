import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Repuesto } from './repuesto.entity';

@Entity('categorias')
export class Categoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string;

  @OneToMany(() => Repuesto, (repuesto) => repuesto.categoria)
  repuestos: Repuesto[];
}
