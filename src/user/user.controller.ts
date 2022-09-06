import { ConversationService } from './../conversation/conversation.service';
import {
  Body,
  Controller,
  Get,
  HttpException,
  Inject,
  Logger,
  OnModuleInit,
  Param,
  Post,
  Query,
  Res,
  Response,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom, Observable } from 'rxjs';

@Controller('user')
export class UserController implements OnModuleInit {
  logger = new Logger('usercontroller');
  private userService;
  constructor(
    @Inject('user_package') private client: ClientGrpc,
    private httpService: HttpService,

    private conversationService: ConversationService,
  ) {}
  onModuleInit() {
    this.userService = this.client.getService('UserService');
  }

  @Get('/search')
  async searchUser(@Query('value') value: string, @Res() res) {
    const { _id } = res.locals.user;

    // const searchUser$ = await this.userService.search({ value, _id });

    const searchUser$ = await this.httpService.get(
      `${process.env.USER_URL}/search?_id=${_id}&value=${value}`,
    );
    const { data }: any = await lastValueFrom(searchUser$);

    if (data?.searchByEmail)
      for await (const account of data?.searchByEmail) {
        const conversation =
          await this.conversationService.getDirectConversation(
            _id,
            account._id,
          );
        account.conversation =
          conversation.length === 0 ? null : conversation?.[0]?.conversation;
      }

    if (data?.searchByName)
      for await (const account of data?.searchByName) {
        const conversation =
          await this.conversationService.getDirectConversation(
            _id,
            account._id,
          );
        account.conversation =
          conversation.length === 0 ? null : conversation?.[0]?.conversation;
      }

    res.json({
      status: 200,
      message: 'search',
      data,
    });
  }

  @Post()
  async create(@Body() body) {
    const { email, password, name } = body;

    // let user$ = await this.userService.create({ email, password, name });
    try {
      let user$ = await this.httpService.post(`${process.env.USER_URL}`, {
        email,
        password,
        name,
      });
      const { data } = await lastValueFrom(user$);
      return {
        status: 200,
        message: 'create success',
        user: data,
      };
    } catch (error) {
      const data = error.response.data;
      throw new HttpException(data, error.response.status);
    }
  }

  @Get('/confirm/:activeCode')
  async confirmAcount(@Param('activeCode') activeCode: string) {
    // let user$: Observable<any> = await this.userService.verifyUser({
    //   activeCode,
    // });

    let user$: Observable<any> = await this.httpService.get(
      `${process.env.USER_URL}/confirm/${activeCode}`,
    );
    let { data } = await lastValueFrom(user$);

    if (data)
      return {
        status: 200,
        message: 'active account success',
        data,
      };
  }

  @Get('/')
  async getUser(@Response() res) {
    let user = res.locals.user;

    if (user) {
      res.send({
        status: 200,
        message: 'get success',
        user,
      });
    }
  }

  @Post('/login')
  async login(@Body() loginUser) {
    try {
      const res$: Observable<any> = await this.httpService.post(
        `${process.env.USER_URL}/login`,
        loginUser,
      );
      const { data } = await lastValueFrom(res$);
      if (data) {
        return {
          status: 200,
          message: 'login success',
          token: data.token,
        };
      }
    } catch (error) {
      const data = error.response.data;
      throw new HttpException(data, error.response.status);
    }
  }
}
