import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { OauthProvider } from './oauth-provider';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, index: true })
  oauthId: string;

  @Prop({ enum: OauthProvider, type: String, required: true })
  oauthProvider: OauthProvider;

  @Prop({ type: String, default: null })
  refreshToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
