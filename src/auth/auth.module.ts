import { forwardRef, Module } from "@nestjs/common";
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from "../users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { JWT_SECRET, JWT_TOKEN_LIFESPAN } from "../common/configs/env";
import { HederaModule } from "../hedera/hedera.module";
import { EncryptService } from "./encrypt.service";
import { MongooseModule } from "@nestjs/mongoose";
import { HederaEncryptedAccessKey, HederaEncryptedAccessKeySchema } from "./models/access-key.model";

@Module({
  imports: [
    UsersModule,
    forwardRef(() => HederaModule),
    MongooseModule.forFeature([{name: HederaEncryptedAccessKey.name, schema: HederaEncryptedAccessKeySchema}]),
    JwtModule.register({
      global: true,
      secret: JWT_SECRET || "secret",
      signOptions: {
        expiresIn: JWT_TOKEN_LIFESPAN
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, EncryptService],
  exports: [AuthService, EncryptService]
})
export class AuthModule {}
