import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { GlobalHttpExceptionFilter } from './common/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Setup Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Autochek API Documentation')
    .setDescription('Autochek Assessment API Documentation')
    .setVersion('1.0')
    .setContact('Timothy.dev', '', 'adeyeyetimothy33@gmal.com')
    .addBearerAuth()
    .build();

  app.enableCors({
    origin: '*', // TODO: Specify origins in production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  const PORT: number = parseInt(process.env.PORT ?? '3000');

  await app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
bootstrap();
