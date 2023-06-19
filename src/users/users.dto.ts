import { IsEmail, IsNotEmpty, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserInput {
  @IsEmail({}, {always: true, message: 'Invalid email'})
  email: string;

  @IsNotEmpty({always: true, message: 'Username cannot be blank'})
  @Matches(/^[a-zA-Z0-9]+$/, {message: 'Invalid username'})
  @MinLength(3, {message: 'Your username is too short'})
  @MaxLength(40, {message: 'Your username is too long'})
  username: string;

  @IsNotEmpty({always: true, message: 'Password cannot be blank'})
  @MinLength(8, {always: true, message: 'Password is too short'})
  @MaxLength(100, {always: true, message: 'Password is too long'})
  password: string;
}

export class LoginInput {
  email: string;
  password: string;
}
