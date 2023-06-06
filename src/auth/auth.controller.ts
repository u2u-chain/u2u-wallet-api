import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post, UseGuards,
  Request
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserInput, LoginInput } from "../users/users.dto";
import { AuthGuard } from "./auth.guard";
import { UsersService } from "../users/users.service";
import { response } from "express";

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {
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
      console.log(e);
      throw new HttpException(e.message || 'Invalid registration info', HttpStatus.BAD_REQUEST);
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('createNetworkAccount')
  async createNetworkAccount(@Request() req, @Body() body) {
    const { publicKey } = body;
    if (!publicKey) {
      throw new HttpException("A public key is required", HttpStatus.BAD_REQUEST);
    }
    const response = await this.authService.createNetworkAccount(publicKey);
    return {
      accountId: response.accountId,
      publicKey: response.publicKey,
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginInput) {
    const tokens = await this.authService.login(loginDto);
    console.log('tokens', tokens);
    return {
      status: 200,
      message: "Logged in successfully",
      data: tokens
    }
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const userProfile = await this.userService.getUserById(req.user.sub.toString());
    return {
      ...req.user,
      publicKey: userProfile.hederaPublicKey,
      networkAccountId: userProfile.hederaAccountId,
      profile: {
        email: userProfile.email,
        fullName: userProfile.fullName,
        avatar: userProfile.avatar,
      }
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refreshToken(@Request() req, @Body() body) {
    const {refreshToken} = body;
    if (!refreshToken) {
      throw new HttpException("A refresh token is required", HttpStatus.BAD_REQUEST);
    }
    try {
      const payload = await this.authService.validateToken(refreshToken);
      if (payload.type === 'refresh') {
        const user = payload.sub;
        const tokens = await this.authService.renewTokens(user, payload);
        return {
          status: 200,
          message: "Success",
          data: tokens
        };
      } else throw new HttpException("Only refresh token can be used", HttpStatus.FORBIDDEN);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.FORBIDDEN);
    }
  }

}
