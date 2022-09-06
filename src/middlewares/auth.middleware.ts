import { lastValueFrom } from 'rxjs';
import {
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private userService;
  constructor(
    @Inject('user_package') private client: ClientGrpc,
    private httpService: HttpService,
  ) {}
  onModuleInit() {
    this.userService = this.client.getService('UserService');
  }
  async use(req: any, res: any, next: () => void) {
    const token = req.headers['x-access-token'];

    try {
      const user$ = this.httpService.get(
        `${process.env.USER_URL}?token=${token}`,
      );
      const { data } = await lastValueFrom(user$);

      if (data) {
        res.locals.user = data;
        return next();
      }
    } catch (error) {
      throw new HttpException(error.response.data, 401);
    }
  }
}
