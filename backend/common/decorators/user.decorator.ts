import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../src/users/entities/user.entity';

export const AuthUser = createParamDecorator(
  (date: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
