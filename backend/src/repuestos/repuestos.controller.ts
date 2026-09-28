import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { RepuestosService } from './repuestos.service';
import { CreateRepuestoDto } from './dto/create-repuesto.dto';
import { UpdateRepuestoDto } from './dto/update-repuesto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/usuario.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@ApiTags('Catálogo de Repuestos')
@Controller('repuestos')
export class RepuestosController {
  constructor(
    private readonly repuestosService: RepuestosService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @ApiOperation({ summary: 'Obtener todos los repuestos (con filtro opcional de búsqueda y categoría)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'categoriaId', required: false, type: Number })
  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('categoriaId') categoriaId?: number,
  ) {
    return this.repuestosService.findAll(search, categoriaId ? Number(categoriaId) : undefined);
  }

  @ApiOperation({ summary: 'Obtener repuestos con bajo stock (Alertas Inteligentes)' })
  @Get('alertas-stock')
  async findLowStock() {
    return this.repuestosService.findLowStock();
  }

  @ApiOperation({ summary: 'Obtener un repuesto por ID' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.repuestosService.findOne(id);
  }

  @ApiOperation({ summary: 'Crear nuevo repuesto' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.JEFE_PISTA)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createDto: CreateRepuestoDto) {
    return this.repuestosService.create(createDto);
  }

  @ApiOperation({ summary: 'Subir imagen de repuesto a Cloudinary' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.JEFE_PISTA)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const url = await this.cloudinaryService.uploadImage(file);
    return { url };
  }

  @ApiOperation({ summary: 'Actualizar repuesto' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.JEFE_PISTA)
  @ApiBearerAuth()
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateRepuestoDto,
  ) {
    return this.repuestosService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'Eliminar repuesto por ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.repuestosService.remove(id);
  }
}
