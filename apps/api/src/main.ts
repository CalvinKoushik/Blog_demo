import { ValidationPipe } from '@nestjs/common';

import { NestFactory } from '@nestjs/core';

import helmet from 'helmet';

import { AppModule } from './app.module';



async function bootstrap() {

  const app = await NestFactory.create(AppModule);



  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  app.setGlobalPrefix('api');

  app.useGlobalPipes(

    new ValidationPipe({

      whitelist: true,

      forbidNonWhitelisted: true,

      transform: true,

    }),

  );

  app.enableCors({

    origin: process.env.FRONTEND_URL || 'http://localhost:3000',

    credentials: true,

  });



  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  console.log(`API running at http://localhost:${port}/api`);

}

void bootstrap();

