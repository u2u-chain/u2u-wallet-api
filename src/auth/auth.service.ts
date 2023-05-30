import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateUserInput, LoginInput } from "../users/users.dto";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { User, UserDocument } from "../users/user.model";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {
  }
  createAccount(createAccount: CreateUserInput) {
    return this.usersService.createUser(createAccount);
  }

  async login(loginData: LoginInput) {
    const user = await this.usersService.authenticate(loginData.email, loginData.password);
    return this.signTokens(user);
  }

  async signTokens(user: UserDocument) {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      iss: process.env.JWT_ISSUER,
      type: 'access'
    });
    const refreshToken = await this.jwtService.signAsync({
      sub: user.id,
      iss: process.env.JWT_ISSUER,
      type: 'refresh'
    }, {
      expiresIn: process.env.JWT_REFRESH_TOKEN_LIFESPAN
    });
    return {
      accessToken,
      refreshToken,
    }
  }

  async validateToken(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_SECRET
    });
  }

  async renewTokens(sub: string) {
    // renew token for a subject
    const user = await this.usersService.getUserById(sub);
    if (!user) throw new HttpException("Invalid information", HttpStatus.FORBIDDEN);
    const tokens = await this.signTokens(user);

    // only return access token
    return tokens.accessToken;
  }
}
