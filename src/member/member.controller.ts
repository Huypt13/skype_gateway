import { lastValueFrom } from 'rxjs';
import { Controller, Param, Post } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Controller('member')
export class MemberController {
  constructor(private httpService: HttpService) {}

  @Post('/lastseen/:id')
  async setLastSeen(@Param('id') _id) {
    const updateObj$ = await this.httpService.post(
      `${process.env.GROUP_URL}/member/lastseen/${_id}`,
    );
    const { data } = await lastValueFrom(updateObj$);

    return data;
  }
}
