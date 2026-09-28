import { Controller, Post, Body, Get, UseGuards, Request, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { UserRole } from '../entities/usuario.entity';

@ApiTags('Autenticación y Usuarios')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Iniciar sesión con credenciales' })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'Registrar un nuevo administrador / usuario' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
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
    return req.user;
  }

  @ApiOperation({ summary: 'Actualizar perfil del usuario autenticado' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put('profile')
  async updateProfile(@Request() req, @Body() updateDto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.id, updateDto);
  }

  @ApiOperation({ summary: 'Listar todos los administradores registrados' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.JEFE_PISTA)
  @ApiBearerAuth()
  @Get('admins')
  async getAllAdmins() {
    return this.authService.getAllAdmins();
  }
}
