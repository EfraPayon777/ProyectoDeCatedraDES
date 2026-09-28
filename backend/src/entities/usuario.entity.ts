import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Orden } from './orden.entity';

export enum UserRole {
  ADMIN = 'Administrador',
  JEFE_PISTA = 'Jefe de Pista',
  MECANICO = 'Mecánico',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password?: string;

  @Column({ type: 'varchar', default: UserRole.MECANICO })
  rol: UserRole;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  fechaRegistro: Date;

  @OneToMany(() => Orden, (orden) => orden.mecanico)
  ordenes: Orden[];
}
