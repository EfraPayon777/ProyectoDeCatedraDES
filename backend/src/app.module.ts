import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CategoriasModule } from './categorias/categorias.module';
import { RepuestosModule } from './repuestos/repuestos.module';
import { EntradasModule } from './entradas/entradas.module';
import { OrdenesModule } from './ordenes/ordenes.module';
import { ReportesModule } from './reportes/reportes.module';

import { Usuario } from './entities/usuario.entity';
import { Categoria } from './entities/categoria.entity';
import { Repuesto } from './entities/repuesto.entity';
import { EntradaInventario } from './entities/entrada-inventario.entity';
import { Orden } from './entities/orden.entity';
import { DetalleOrden } from './entities/detalle-orden.entity';

import { AuthService } from './auth/auth.service';
import { CategoriasService } from './categorias/categorias.service';
import { RepuestosService } from './repuestos/repuestos.service';
import { OrdenesService } from './ordenes/ordenes.service';

const dbType = process.env.DB_TYPE || 'sqlite';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        if (dbType === 'postgres' || process.env.POSTGRES_HOST) {
          return {
            type: 'postgres',
            host: process.env.POSTGRES_HOST || 'localhost',
            port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
            username: process.env.POSTGRES_USER || 'postgres',
            password: process.env.POSTGRES_PASSWORD || 'postgres',
            database: process.env.POSTGRES_DB || 'lubripoint_db',
            entities: [Usuario, Categoria, Repuesto, EntradaInventario, Orden, DetalleOrden],
            synchronize: true, // Para desarrollo inicial
          };
        } else {
          return {
            type: 'sqlite',
            database: 'lubripoint.sqlite',
            entities: [Usuario, Categoria, Repuesto, EntradaInventario, Orden, DetalleOrden],
            synchronize: true,
          };
        }
      },
    }),
    AuthModule,
    CategoriasModule,
    RepuestosModule,
    EntradasModule,
    OrdenesModule,
    ReportesModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private authService: AuthService,
    private categoriasService: CategoriasService,
    private repuestosService: RepuestosService,
    private ordenesService: OrdenesService,
  ) {}

  async onModuleInit() {
    // Inicializar datos semilla para pruebas inmediatas
    await this.authService.seedAdminIfEmpty();
    await this.categoriasService.seedDefaults();
    await this.repuestosService.seedDefaults();
    await this.ordenesService.seedDefaults();
  }
}
