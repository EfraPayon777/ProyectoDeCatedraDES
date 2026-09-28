import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from '../entities/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private categoriaRepository: Repository<Categoria>,
  ) {}

  async findAll(): Promise<Categoria[]> {
    return this.categoriaRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOne({ where: { id } });
    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return categoria;
  }

  async create(createDto: CreateCategoriaDto): Promise<Categoria> {
    const existing = await this.categoriaRepository.findOne({ where: { nombre: createDto.nombre } });
    if (existing) {
      throw new ConflictException('Ya existe una categoría con este nombre');
    }
    const nueva = this.categoriaRepository.create(createDto);
    return this.categoriaRepository.save(nueva);
  }

  async remove(id: number): Promise<void> {
    const categoria = await this.findOne(id);
    await this.categoriaRepository.remove(categoria);
  }

  async seedDefaults() {
    const count = await this.categoriaRepository.count();
    if (count === 0) {
      const defaults = [
        'Aceite de Motor',
        'Aceite de Caja',
        'Frenos',
        'Suspensión y Dirección',
        'Filtros',
        'Fajas y Accesorios',
      ];
      for (const nombre of defaults) {
        await this.categoriaRepository.save(this.categoriaRepository.create({ nombre }));
      }
      console.log('✅ Categorías por defecto sembradas correctamente');
    }
  }
}
