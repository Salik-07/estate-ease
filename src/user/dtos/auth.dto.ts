import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  Matches,
} from 'class-validator';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Matches(/^\+92[-\s]?(\d{3})[-\s]?(\d{7})$/, {
    message: 'phone must be a valid number',
  })
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(5)
  password: string;
}
