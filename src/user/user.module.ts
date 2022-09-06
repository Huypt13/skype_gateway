import { ConversationModule } from './../conversation/conversation.module';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';

@Module({
  imports: [ConversationModule],
  controllers: [UserController],
})
export class UserModule {}
