import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload } from '../model/jwt-payload.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = JwtPayload>(
    err: unknown,
    user: TUser | false,
    info: any,
    context: ExecutionContext,
  ) {
    if (err || !user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
