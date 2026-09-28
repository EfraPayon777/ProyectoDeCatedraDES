import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EntradasService } from './entradas.service';
import { CreateEntradaDto } from './dto/create-entrada.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/usuario.entity';

@ApiTags('Entradas de Inventario')
@Controller('entradas')
export class EntradasController {
  constructor(private readonly entradasService: EntradasService) {}

  @ApiOperation({ summary: 'Listar historial de entradas de inventario' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  async findAll() {
    return this.entradasService.findAll();
  }

  @ApiOperation({ summary: 'Registrar nueva entrada de repuesto e incrementar stock atómicamente' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.JEFE_PISTA)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createDto: CreateEntradaDto) {
    return this.entradasService.create(createDto);
  }
}
