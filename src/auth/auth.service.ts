import { Injectable } from '@nestjs/common';
import { CreateUserInput } from "../users/users.dto";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
  ) {
  }
  createAccount(createAccount: CreateUserInput) {
    return this.usersService.createUser(createAccount);
  }
}
