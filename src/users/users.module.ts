import { forwardRef, Module } from "@nestjs/common";
import { UsersService } from './users.service';
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./user.model";
import { HederaModule } from "../hedera/hedera.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
    forwardRef(() => HederaModule),
    forwardRef(() => AuthModule),
  ],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
