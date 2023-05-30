import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from "@nestjs/core";
import { HttpExceptionFilter } from "./common/exceptions/CustomExceptionFilter";
import { MONGO_URI } from "./common/configs/env";

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    MongooseModule.forRoot(MONGO_URI),
  ],
  controllers: [AppController],
  providers: [{
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    AppService
  ]
})
export class AppModule {
}
