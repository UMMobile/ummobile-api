import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { UtilsModule } from 'src/utils/utils.module';
import { HttpModule } from '@nestjs/axios';
import { ApiManagerHttpService } from 'src/services/http/apiManager.http';

@Module({
  imports: [
    UtilsModule,
    HttpModule.registerAsync({
      useClass: ApiManagerHttpService,
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService]
})
export class NotificationsModule {}
