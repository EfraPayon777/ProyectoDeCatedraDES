import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario, UserRole } from '../entities/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { getPermisos } from './permissions';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usuarioRepository.findOne({
      where: { email },
      select: ['id', 'nombre', 'email', 'password', 'rol', 'activo', 'fechaRegistro'],
    });

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    if (!user.activo) {
      throw new UnauthorizedException('La cuenta de usuario se encuentra desactivada');
    }

    const payload = { email: user.email, sub: user.id, rol: user.rol, nombre: user.nombre };
    return {
      access_token: this.jwtService.sign(payload),
      user: this.conPermisos(user),
    };
  }

  async register(registerDto: RegisterUserDto) {
    const existingUser = await this.usuarioRepository.findOne({ where: { email: registerDto.email } });
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const nuevoUsuario = this.usuarioRepository.create({
      nombre: registerDto.nombre,
      email: registerDto.email,
      password: hashedPassword,
      rol: registerDto.rol,
    });

    const saved = await this.usuarioRepository.save(nuevoUsuario);
    const { password, ...userWithoutPassword } = saved;
    return userWithoutPassword;
  }

  async updateProfile(userId: number, updateDto: UpdateProfileDto) {
    const user = await this.usuarioRepository.findOne({
      where: { id: userId },
      select: ['id', 'nombre', 'email', 'password', 'rol', 'activo', 'fechaRegistro'],
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (updateDto.nombre) user.nombre = updateDto.nombre;
    if (updateDto.email && updateDto.email !== user.email) {
      const existing = await this.usuarioRepository.findOne({ where: { email: updateDto.email } });
      if (existing && existing.id !== userId) {
        throw new ConflictException('El correo electrónico ya está registrado');
      }
      user.email = updateDto.email;
    }
    if (updateDto.password && updateDto.password.trim() !== '') {
      user.password = await bcrypt.hash(updateDto.password, 10);
    }

    const updated = await this.usuarioRepository.save(user);
    const { password, ...result } = updated;
    return this.conPermisos(result);
  }

  /** Agrega los permisos efectivos del rol a la respuesta (el frontend adapta la interfaz con ellos). */
  conPermisos<T extends { rol?: string }>(user: T) {
    return { ...user, permisos: getPermisos(user?.rol) };
  }

  async cambiarRol(userId: number, rol: UserRole, actorId: number) {
    const user = await this.usuarioRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }
    if (user.rol === UserRole.ADMIN && rol !== UserRole.ADMIN) {
      if (userId === actorId) {
        throw new BadRequestException('No puede quitarse a sí mismo el rol de Administrador');
      }
      const admins = await this.usuarioRepository.count({ where: { rol: UserRole.ADMIN, activo: true } });
      if (admins <= 1) {
        throw new BadRequestException('Debe existir al menos un Administrador activo');
      }
    }
    user.rol = rol;
    const saved = await this.usuarioRepository.save(user);
    return this.conPermisos(saved);
  }

  async getAllAdmins() {
    return this.usuarioRepository.find({
      order: { id: 'ASC' },
    });
  }

  async seedAdminIfEmpty() {
    const count = await this.usuarioRepository.count();
    if (count === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = this.usuarioRepository.create({
        nombre: 'Admin LubriPoint',
        email: 'lubripointsv@gmail.com',
        password: hashedPassword,
        rol: UserRole.ADMIN,
        activo: true,
      });
      await this.usuarioRepository.save(admin);
      console.log('✅ Seed por defecto: Admin creado (lubripointsv@gmail.com / admin123)');
    }
  }
}
