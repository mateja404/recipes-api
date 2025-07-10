import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { useContainer } from 'class-validator';
import helmet from "helmet";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
  useContainer(app.select(AppModule), {
    fallbackOnErrors: true
  });
  app.use(helmet());
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', true);
}
bootstrap();