import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserInput } from "../users/users.dto";

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService
  ) {
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    // return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  async register(@Body() registerDto: CreateUserInput) {
    try {
      const newAccount = await this.authService.createAccount(registerDto);
      return {
        status: 200,
        message: "Account created successfully",
        data: newAccount,
      };
    } catch (e) {
      throw new HttpException(e.message || 'Invalid registration info', HttpStatus.BAD_REQUEST);
    }
  }
}
