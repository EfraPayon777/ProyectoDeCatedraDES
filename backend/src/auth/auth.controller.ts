import { Controller, Post, Body, Get, UseGuards, Request, Put, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { RequierePermisos } from './roles.decorator';
import { Permiso } from './permissions';
import { UpdateRolDto } from './dto/update-rol.dto';

@ApiTags('Autenticación y Usuarios')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Iniciar sesión con credenciales' })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'Registrar un nuevo usuario (rol: Administrador, Empleado, Jefe de Pista o Mecánico). Solo Administrador.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequierePermisos(Permiso.USUARIOS_CREATE)
  @ApiBearerAuth()
  @Post('register')
  async register(@Body() registerDto: RegisterUserDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'Obtener datos del usuario autenticado actual' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  getProfile(@Request() req) {
    return this.authService.conPermisos(req.user);
  }

  @ApiOperation({ summary: 'Actualizar perfil del usuario autenticado' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put('profile')
  async updateProfile(@Request() req, @Body() updateDto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.id, updateDto);
  }

  @ApiOperation({ summary: 'Listar todos los usuarios registrados (solo Administrador)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequierePermisos(Permiso.USUARIOS_VIEW)
  @ApiBearerAuth()
  @Get('admins')
  async getAllAdmins() {
    return this.authService.getAllAdmins();
  }

  @ApiOperation({ summary: 'Asignar rol a un usuario (Administrador, Jefe de Pista o Mecánico). Solo Administrador.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequierePermisos(Permiso.USUARIOS_ROLES)
  @ApiBearerAuth()
  @Patch('usuarios/:id/rol')
  async cambiarRol(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRolDto) {
    return this.authService.cambiarRol(id, dto.rol, req.user.id);
  }
}
