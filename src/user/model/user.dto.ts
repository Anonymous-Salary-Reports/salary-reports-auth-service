import { Role } from './role';
import { IsMongoId } from 'class-validator';

export class UserDto {
  @IsMongoId()
  id: string;

  role: Role;
}
