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
        const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
        const isPostgres = dbType === 'postgres' || !!databaseUrl || !!process.env.POSTGRES_HOST || !!process.env.PGHOST;

        if (isPostgres) {
          if (databaseUrl) {
            return {
              type: 'postgres',
              url: databaseUrl,
              ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
              entities: [Usuario, Categoria, Repuesto, EntradaInventario, Orden, DetalleOrden],
              synchronize: true, // Para desarrollo y cátedra
            };
          }
          return {
            type: 'postgres',
            host: process.env.POSTGRES_HOST || process.env.PGHOST || 'localhost',
            port: parseInt(process.env.POSTGRES_PORT || process.env.PGPORT || '5432', 10),
            username: process.env.POSTGRES_USER || process.env.PGUSER || 'postgres',
            password: process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD || 'postgres',
            database: process.env.POSTGRES_DB || process.env.PGDATABASE || 'lubripoint_db',
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
            entities: [Usuario, Categoria, Repuesto, EntradaInventario, Orden, DetalleOrden],
            synchronize: true,
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
