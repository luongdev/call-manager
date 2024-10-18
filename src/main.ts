import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerFactory } from '@providers/logger/logger.factory';
import { AllConfigType } from '@config/config.type';
import { ConfigService } from '@nestjs/config';
import { VersioningType } from '@nestjs/common';
import { ResolvePromisesInterceptor } from './utils/serializer.interceptor';

import appConfigFn, { AppConfig } from '@config/app.config';
import { WsAdapter } from '@nestjs/platform-ws';

const appConfig = appConfigFn() as AppConfig;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: [appConfig.logLevel]
  });

  const loggerFactory = await app.resolve(LoggerFactory);
  app.useLogger(loggerFactory.createLogger('main'));
  app.enableShutdownHooks();

  const configService = await app.resolve(ConfigService<AllConfigType>);

  app.setGlobalPrefix(configService.getOrThrow('app.apiPrefix', { infer: true }), { exclude: ['/'] });
  app.enableVersioning({ type: VersioningType.URI });

  app.useGlobalInterceptors(
    new ResolvePromisesInterceptor(),
  )

  app.useWebSocketAdapter(new WsAdapter(app));

  await app.listen(appConfig.port);
}

bootstrap().then(() => {
  // setInterval(() => {
  // const used = process.memoryUsage().heapUsed / 1024 / 1024;
  // console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
  // }, 5000);
}).catch(console.error);
