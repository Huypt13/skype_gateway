import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { AuthMiddleware } from './middlewares/auth.middleware';
import { ConfigModule } from '@nestjs/config';
import { ConversationModule } from './conversation/conversation.module';
import { GlobalModule } from './global.module';
import { MemberController } from './member/member.controller';
import { MessageModule } from './message/message.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    UserModule,
    ConversationModule,
    ConfigModule.forRoot({ isGlobal: true }),
    GlobalModule,
    MessageModule,
  ],
  controllers: [MemberController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'user/confirm/(.*)', method: RequestMethod.GET },
        { path: 'user/login', method: RequestMethod.POST },
        { path: 'user', method: RequestMethod.POST },
      )
      .forRoutes('/*');
  }
}
