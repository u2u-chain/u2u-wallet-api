import { IsEmail, IsNotEmpty, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserInput {
  @IsEmail({}, {always: true, message: 'Invalid email'})
  email: string;

  @IsNotEmpty({always: true, message: 'Name cannot be blank'})
  @Matches(/^([^0-9!@#$%^&*()_+=[\]{}|\\,./?<>;:"“”‘’·„‚«»‹›]+ [^0-9!@#$%^&*()_+=[\]{}|\\,./?<>;:"“”‘’·„‚«»‹›]+)+$/i, {message: 'Invalid name'})
  fullName: string;

  @IsNotEmpty({always: true, message: 'Password cannot be blank'})
  @MinLength(8, {always: true, message: 'Password is too short'})
  @MaxLength(64, {always: true, message: 'Password is too long'})
  password: string;
}

export class LoginInput {
  email: string;
  password: string;
}
