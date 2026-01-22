import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload } from '../model/auth-model.types';
import { Role } from '../../user/model/role';

@Injectable()
export class JwtAuthAdminGuard extends AuthGuard('jwt') {
  handleRequest<TUser = JwtPayload>(
    err: unknown,
    user: TUser | false,
    info: any,
    context: ExecutionContext,
  ) {
    if (err || !user) {
      throw new UnauthorizedException();
    }

    if ((user as unknown as JwtPayload).role !== Role.ADMIN) {
      throw new UnauthorizedException('Admin access required');
    }

    return user;
  }
}
