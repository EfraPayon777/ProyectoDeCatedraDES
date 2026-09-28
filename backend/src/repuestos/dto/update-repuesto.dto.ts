import { PartialType } from '@nestjs/swagger';
import { CreateRepuestoDto } from './create-repuesto.dto';

export class UpdateRepuestoDto extends PartialType(CreateRepuestoDto) {}
