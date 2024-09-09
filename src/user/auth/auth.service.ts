import { Injectable, ConflictException, HttpException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserType } from '@prisma/client';

interface SignupParams {
  name: string;
  phone: string;
  email: string;
  password: string;
}
interface SigninParams {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async signup({ name, phone, email, password }: SignupParams) {
    const userExists = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (userExists) {
      throw new ConflictException();
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prismaService.user.create({
      data: {
        name,
        phone,
        email,
        password: hashedPassword,
        user_type: UserType.BUYER,
      },
    });

    const token = await this.generateJWT(user.name, user.id);

    return token;
  }

  async signin({ email, password }: SigninParams) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new HttpException('Invalid credentials.', 400);
    }

    const hashedPassword = user.password;

    const isValidPassword = await bcrypt.compare(password, hashedPassword);

    if (!isValidPassword) {
      throw new HttpException('Invalid credentials.', 400);
    }

    const token = await this.generateJWT(user.name, user.id);

    return token;
  }

  private generateJWT(name: string, id: number) {
    return jwt.sign({ name, id }, process.env.SECRET_KEY, {
      expiresIn: 3600000,
    });
  }
}
