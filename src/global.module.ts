import { CacheModule, Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { HttpModule } from '@nestjs/axios';
import { join } from 'path';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'user_package',
        transport: Transport.GRPC,
        options: {
          // url: `skype-user.herokuapp.com`,
          package: 'user',
          protoPath: join(__dirname, 'proto', 'user.proto'),
        },
      },
    ]),
    HttpModule.register({ timeout: 30000 }),
    CacheModule.register(),
  ],
  exports: [ClientsModule, HttpModule, CacheModule],
})
export class GlobalModule {}
