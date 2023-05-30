import { Injectable } from '@nestjs/common';
import { CreateUserInput, LoginInput } from "../users/users.dto";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";

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
    const account = await this.usersService.authenticate(loginData.email, loginData.password);
    return this.jwtService.signAsync(account);
  }
}
