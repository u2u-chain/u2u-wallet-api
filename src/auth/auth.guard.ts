import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { JWT_SECRET, SYMMETRIC_PASSWORD_SECRET } from "../common/configs/env";
import { EncryptService } from "./encrypt.service";
import { InjectModel } from "@nestjs/mongoose";
import { HederaEncryptedAccessKey, HederaEncryptedAccessKeyDocument } from "./models/access-key.model";
import { Model } from "mongoose";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectModel(HederaEncryptedAccessKey.name)
    private hederaEncryptedAccessKey: Model<HederaEncryptedAccessKeyDocument>,
    private jwtService: JwtService,
    private encryptService: EncryptService,
  ) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: JWT_SECRET
      });

      const encryptedSymmetricPrivateKey = payload.encryptedSymmetricPrivateKey;
      if (!encryptedSymmetricPrivateKey) throw new Error("Failed to get encrypted symmetric pvk")
      const b64SymmetricPrivateKey = await this.encryptService.decryptPrivateKeyWithPassword(encryptedSymmetricPrivateKey, SYMMETRIC_PASSWORD_SECRET);
      const symmetricAccessKeyId = payload.keyId;
      const doc = await this.hederaEncryptedAccessKey.findOne({
        _id: symmetricAccessKeyId,
      });
      if (!doc) throw new UnauthorizedException();
      const encryptedKey = doc.encryptedKey;
      payload.privateKey = await this.encryptService.decryptPrivateKey(encryptedKey, b64SymmetricPrivateKey);
      delete payload.encryptedSymmetricPrivateKey;

      request["user"] = payload;
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
