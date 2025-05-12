import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { env } from './config/validation.js';

/* Swagger Docs Implementation Modules */
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /* global stuff */
  app.setGlobalPrefix('api');
  app.enableCors({ origin: '*' });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  /* 👇  Swagger setup */
  const config = new DocumentBuilder()
    .setTitle('Full-Stack Challenge API')
    .setDescription('Company search, prospects, enrichment jobs')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(env.PORT);
  // eslint-disable-next-line no-console
  console.log(`API ready on http://localhost:${env.PORT}/api`);
}

bootstrap();
