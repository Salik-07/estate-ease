import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';

interface JWTPayload {
  id: number;
  name: string;
  iat: number;
  exp: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request?.headers?.authorization;

    if (!authorizationHeader) {
      throw new UnauthorizedException('Unauthorized');
    }

    const token = authorizationHeader.split('Bearer ')[1];
    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    try {
      const payload = (await jwt.verify(
        token,
        process.env.SECRET_KEY,
      )) as JWTPayload;

      const user = await this.prismaService.user.findUnique({
        where: {
          id: payload.id,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Unauthorized');
      }

      if (roles?.length && !roles.includes(user.user_type)) {
        throw new ForbiddenException('You do not have permission');
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}
