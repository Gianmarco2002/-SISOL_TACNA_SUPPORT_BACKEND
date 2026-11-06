import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Detrás de nginx/Caddy (red interna de Docker): usar la IP real del
  // cliente, necesaria para que el límite de peticiones sea por usuario.
  if (process.env.TRUST_PROXY === 'true') {
    app.set('trust proxy', 'loopback, linklocal, uniquelocal');
  }
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  const allowedOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins.length ? allowedOrigins : '*',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
