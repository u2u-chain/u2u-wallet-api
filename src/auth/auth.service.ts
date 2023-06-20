import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { CreateUserInput, LoginInput } from "../users/users.dto";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { User, UserDocument } from "../users/user.model";
import { JWT_ISSUER, JWT_REFRESH_TOKEN_LIFESPAN, JWT_SECRET, SYMMETRIC_PASSWORD_SECRET } from "../common/configs/env";
import { HederaService } from "../hedera/hedera.service";
import { EncryptService } from "./encrypt.service";
import { InjectModel } from "@nestjs/mongoose";
import { HederaEncryptedAccessKey, HederaEncryptedAccessKeyDocument } from "./models/access-key.model";
import { Model } from "mongoose";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(HederaEncryptedAccessKey.name)
    private hederaEncryptedAccessKey: Model<HederaEncryptedAccessKeyDocument>,
    private usersService: UsersService,
    private jwtService: JwtService,
    @Inject(forwardRef(() => HederaService))
    private hederaService: HederaService,
    @Inject(forwardRef(() => EncryptService))
    private encryptService: EncryptService,
  ) {
  }
  createAccount(createAccount: CreateUserInput) {
    const processedAccount = {
      ...createAccount,
      email: createAccount.email.toLowerCase(),
      username: createAccount.username.toLowerCase(),
    }
    return this.usersService.createUser(processedAccount);
  }

  async createNetworkAccount(publicKey: string) {
    return this.hederaService.createAccount(0, publicKey);
  }

  async login(loginData: LoginInput) {
    const user = await this.usersService.authenticate(loginData.email.toLowerCase(), loginData.password);
    const encryptedPrivateKey = user.hederaPrivateKey;
    const decryptedPrivateKey = await this.encryptService.decryptPrivateKeyWithPassword(encryptedPrivateKey, loginData.password);
    const hederaEncryptedData = await this.generateAsymmetricKeyForHedera(user, decryptedPrivateKey);

    return this.signTokens(user, hederaEncryptedData);
  }

  async signTokens(user: UserDocument, encryptedData) {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      iss: JWT_ISSUER,
      type: 'access',
      ...encryptedData
    });
    const refreshToken = await this.jwtService.signAsync({
      sub: user.id,
      iss: JWT_ISSUER,
      type: 'refresh',
      ...encryptedData
    }, {
      expiresIn: JWT_REFRESH_TOKEN_LIFESPAN
    });
    return {
      accessToken,
      refreshToken,
    }
  }

  async generateAsymmetricKeyForHedera(user: UserDocument, protectedKey: string) {
    const {publicKey, privateKey} = await this.encryptService.generateKeyPair();
    const base64PublicKey = publicKey.toString('base64');
    const base64PrivateKey = privateKey.toString('base64');
    const encryptedPrivateKey = await this.encryptService.encryptPrivateKey(protectedKey, base64PublicKey);

    // now encrypt symmetric key again
    const encryptedSymmetricPrivateKey = await this.encryptService.encryptPrivateKeyWithPassword(base64PrivateKey, SYMMETRIC_PASSWORD_SECRET);

    const key = await this.hederaEncryptedAccessKey.create({
      userId: user._id,
      hederaAccountId: user.hederaAccountId,
      publicKey: base64PublicKey,
      encryptedKey: encryptedPrivateKey,
    });

    return {
      encryptedSymmetricPrivateKey,
      keyId: key._id,
    }
  }

  async validateToken(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: JWT_SECRET
    });
  }

  async renewTokens(sub: string, oldPayload: any) {
    // renew token for a subject
    const user = await this.usersService.getUserById(sub);
    if (!user) throw new HttpException("Invalid information", HttpStatus.FORBIDDEN);
    const tokens = await this.signTokens(user, {
      keyId: oldPayload.keyId,
      encryptedSymmetricPrivateKey: oldPayload.encryptedSymmetricPrivateKey,
    });

    // only return access token
    return tokens.accessToken;
  }
}
