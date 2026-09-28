import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdenesService } from './ordenes.service';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Órdenes de Trabajo / Facturación')
@Controller('ordenes')
export class OrdenesController {
  constructor(private readonly ordenesService: OrdenesService) {}

  @ApiOperation({ summary: 'Listar todas las órdenes de trabajo / ventas' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  async findAll() {
    return this.ordenesService.findAll();
  }

  @ApiOperation({ summary: 'Obtener detalle de una orden por ID' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordenesService.findOne(id);
  }

  @ApiOperation({ summary: 'Crear e ingresar una nueva orden de trabajo / factura' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Request() req, @Body() createDto: CreateOrdenDto) {
    return this.ordenesService.create(createDto, req.user?.id);
  }
}
