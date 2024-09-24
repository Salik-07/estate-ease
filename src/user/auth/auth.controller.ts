import {
  Body,
  Controller,
  Post,
  Param,
  ParseEnumPipe,
  UnauthorizedException,
  Get,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserType } from '@prisma/client';
import { AuthService } from './auth.service';
import { GenerateProductKeyDto, SigninDto, SignupDto } from '../dtos/auth.dto';
import { User } from '../decoratos/user.decorator';
import { UserInfo } from '../decoratos/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup/:userType')
  async signup(
    @Body() body: SignupDto,
    @Param('userType', new ParseEnumPipe(UserType)) userType: UserType,
  ) {
    if (userType !== UserType.BUYER) {
      if (!body.productKey) {
        throw new UnauthorizedException();
      }

      const validProductKey = `${body.email}_${userType}_${process.env.PRODUCT_SECRET_KEY}`;
      const isValidProductKey = await bcrypt.compare(
        validProductKey,
        body.productKey,
      );

      if (!isValidProductKey) {
        throw new UnauthorizedException();
      }
    }

    return this.authService.signup(body, userType);
  }

  @Post('/signin')
  signin(@Body() body: SigninDto) {
    return this.authService.signin(body);
  }

  @Post('/key')
  generateProductKey(@Body() body: GenerateProductKeyDto) {
    return this.authService.generateProductKey(body);
  }

  @Get('me')
  me(@User() user: UserInfo) {
    return user;
  }
}
