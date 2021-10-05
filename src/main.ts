import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }));

  var pjson = require('../package.json');
  const config = new DocumentBuilder()
    .setTitle('UMMobile API')
    .setDescription('The API for the UMMobile app')
    .setVersion(pjson.version)
    .setContact('Jonathan Gómez', 'https://jonathangomz.github.io', 'jonicgp97@gmail.com')
    .addServer('http://172.16.57.201:3000', 'Sandbox server')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Swagger: UMMobile API',
  });

  await app.listen(3000);
}
bootstrap();
