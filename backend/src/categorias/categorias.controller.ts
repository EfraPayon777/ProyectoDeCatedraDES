import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { RequierePermisos } from '../auth/roles.decorator';
import { Permiso } from '../auth/permissions';

@ApiTags('Categorías')
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @ApiOperation({ summary: 'Obtener todas las categorías' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequierePermisos(Permiso.CATALOGO_VIEW)
  @ApiBearerAuth()
  @Get()
  async findAll() {
    return this.categoriasService.findAll();
  }

  @ApiOperation({ summary: 'Crear una nueva categoría' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequierePermisos(Permiso.CATALOGO_CREATE)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createDto: CreateCategoriaDto) {
    return this.categoriasService.create(createDto);
  }

  @ApiOperation({ summary: 'Actualizar una categoría existente por ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequierePermisos(Permiso.CATALOGO_EDIT)
  @ApiBearerAuth()
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: CreateCategoriaDto,
  ) {
    return this.categoriasService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'Eliminar categoría por ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequierePermisos(Permiso.CATALOGO_DELETE)
  @ApiBearerAuth()
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.remove(id);
  }
}
