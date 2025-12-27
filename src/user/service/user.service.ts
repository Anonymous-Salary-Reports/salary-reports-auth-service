// users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../model/user.schema';
import { OauthProvider } from '../model/oauth-provider';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findOrCreateByOAuthId(
    oauthId: string,
    oauthProvider: OauthProvider,
  ): Promise<User> {
    let user = await this.userModel.findOne({
      oauthId,
      oauthProvider,
    });

    if (!user) {
      user = await this.userModel.create({
        oauthId,
        oauthProvider,
      });
    }

    return user;
  }

  async findById(userId: string): Promise<User | null> {
    return this.userModel.findById(userId);
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
}
