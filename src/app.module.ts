import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from 'config/configuration';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { UserMiddlewares } from './users/middleware/user.midleware';
import { UsersController } from './users/users.controller';
import { Jwt } from './users/utils/jwt';
import { TicketsModule } from './tickets/tickets.module';

const configService = new ConfigService();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRoot(configService.get('mongo_uri'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      writeConcern: {
        wtimeoutMS: 600000,
      },
    }),
    AuthModule,
    UsersModule,
    TicketsModule,
  ],
  controllers: [],
  providers: [Jwt],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddlewares).forRoutes(UsersController);
  }
}
