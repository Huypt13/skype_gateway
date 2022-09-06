import { ConversationService } from './../conversation/conversation.service';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  Res,
  ForbiddenException,
  Inject,
  CACHE_MANAGER,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
@Controller('message')
export class MessageController {
  constructor(
    private httpService: HttpService,
    private converSationService: ConversationService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  // get message by conversationId
  @Get('/:id')
  async getMessage(@Param('id') id: string, @Query('skip') skip: number) {
    let message$ = await this.httpService.get(
      `${process.env.MESSAGE_URL}/message/${id}?skip=${skip}`,
    );

    const message = await lastValueFrom(message$);
    for await (const element of message.data) {
      const member = await this.converSationService.getMember(
        element.senderId,
        id,
      );

      element.nickName = member.nickName;

      const user = await this.cacheManager.get(element.senderId);
      if (!user) {
        const user$ = this.httpService.get(
          `${process.env.USER_URL}/${element.senderId}`,
        );
        const { data } = await lastValueFrom(user$);
        await this.cacheManager.set(element.senderId, data, { ttl: 3600 });
        if (data) {
          element.user = data;
        }
      } else {
        element.user = user;
      }
    }
    return {
      status: 200,
      message: 'List message',
      data: message.data,
    };
  }

  @Post()
  async create(@Res() res, @Body() body) {
    const user = res.locals.user;

    const { senderId, conversationId, content } = body;
    if (user._id != senderId) {
      throw new ForbiddenException({ status: 403, message: 'k có quyền' });
    }

    let message$ = await this.httpService.post(
      `${process.env.MESSAGE_URL}/message`,
      { senderId, conversationId, content },
    );
    let message = await lastValueFrom(message$);
    let member = await this.converSationService.getMember(
      senderId,
      conversationId,
    );
    if (member) {
      message.data.nickName = member.nickName;
    }

    const user1 = await this.cacheManager.get(senderId);
    if (!user1) {
      const user$ = this.httpService.get(`${process.env.USER_URL}/${senderId}`);
      const { data } = await lastValueFrom(user$);
      if (data) {
        message.data.user = data;
      }
      await this.cacheManager.set(senderId, data, { ttl: 3600 });
    } else {
      message.data.user = user1;
    }

    res.send({
      status: 200,
      message: 'send message',
      data: message.data,
    });
  }
}
