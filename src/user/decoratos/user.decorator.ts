import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UserInfo {
  id: number;
  name: string;
  iat: number;
  exp: number;
}

export const User = createParamDecorator((_data, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  return request.user;
});
