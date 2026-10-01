import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para conexión con React Vite
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Prefijo global para las APIs REST
  app.setGlobalPrefix('api');

  // Validaciones globales con class-validator y class-transformer
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Documentación interactiva Swagger
  const config = new DocumentBuilder()
    .setTitle('LUBRIPOINT API - Gestión de Inventario y Reparaciones')
    .setDescription(
      'Documentación OpenAPI/Swagger para el backend del taller mecánico Lubripoint. Manejo de catálogo, stock, facturación y roles.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Servidor backend Lubripoint iniciado en: http://localhost:${port}/api`);
  console.log(`📚 Documentación Swagger disponible en: http://localhost:${port}/api/docs`);
}
bootstrap();
