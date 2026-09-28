import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/usuario.entity';

@ApiTags('Categorías')
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @ApiOperation({ summary: 'Obtener todas las categorías' })
  @Get()
  async findAll() {
    return this.categoriasService.findAll();
  }

  @ApiOperation({ summary: 'Crear una nueva categoría' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.JEFE_PISTA)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createDto: CreateCategoriaDto) {
    return this.categoriasService.create(createDto);
  }

  @ApiOperation({ summary: 'Eliminar categoría por ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.remove(id);
  }
}
