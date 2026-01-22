// users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../model/user.schema';
import { OauthProvider } from '../model/oauth-provider';
import { Role } from '../model/role';
import { ConfigService } from '@nestjs/config';
import { UserDto } from '../model/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly configService: ConfigService,
  ) {}

  async findOrCreateByOAuthId(
    oauthId: string,
    oauthProvider: OauthProvider,
  ): Promise<User> {
    let user = await this.userModel.findOne({
      oauthId,
      oauthProvider,
    });

    if (!user) {
      const role =
        oauthId == this.configService.get('INITIAL_ADMIN_OAUTH_ID')
          ? Role.ADMIN
          : Role.USER;
      user = await this.userModel.create({
        oauthId,
        oauthProvider,
        role,
      });
    }

    return user;
  }

  async findById(userId: string): Promise<User | null> {
    return this.userModel.findById(userId);
  }

  async findAll(): Promise<UserDto[]> {
    const users = await this.userModel.find();
    return users.map((user) => ({ id: user._id.toString(), role: user.role }));
  }

  async saveRefreshToken(userId: string, refreshToken: string): Promise<User> {
    const updated = await this.userModel.findByIdAndUpdate(
      userId,
      { refreshToken },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return updated;
  }

  async clearRefreshToken(userId: string): Promise<User> {
    const updated = await this.userModel.findByIdAndUpdate(
      userId,
      { refreshToken: null },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return updated;
  }

  async makeAdmin(userId: string): Promise<UserDto> {
    const updated = await this.userModel.findByIdAndUpdate(
      userId,
      { role: Role.ADMIN },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return { id: updated._id.toString(), role: updated.role };
  }
}
