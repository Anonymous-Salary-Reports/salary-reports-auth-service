import { Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { JwtAuthAdminGuard } from '../../auth/guards/jwt-auth-admin.guard';
import { UserDto } from '../model/user.dto';

@Controller('user')
@UseGuards(JwtAuthAdminGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/find-all')
  async findAllUsers(): Promise<UserDto[]> {
    return this.userService.findAll();
  }

  @Put('/make-admin/:userId')
  async makeAdmin(@Param() userId: string): Promise<UserDto> {
    return await this.userService.makeAdmin(userId);
  }
}
