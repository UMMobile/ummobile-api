import { Controller, Get, Post, Body, Param, UseGuards, Headers, ForbiddenException, Put, Query, ParseEnumPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UpdateNotificationDto } from './dto/updateNotification.dto';
import { UtilsService } from 'src/utils/utils.service';
import { TokenGuard } from 'src/services/guards/token.guard';
import { NotificationEvent } from './entities/notification.entity';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly utils: UtilsService,
  ) {}

  @Get()
  @UseGuards(TokenGuard)
  getNotifications(@Headers('authorization') token: String) {
    if(this.utils.isStudent(token) || this.utils.isEmployee(token)) {
      const userId: String = this.utils.getUserId(token);
      return this.notificationsService.fetchNotifications(userId);
    } else throw new ForbiddenException();
  }

  @Get(':notificationId')
  @UseGuards(TokenGuard)
  getSingleNotification(
    @Headers('authorization') token: String,
    @Param('notificationId') notificationId: String,
  ) {
    if(this.utils.isStudent(token) || this.utils.isEmployee(token)) {
      const userId: String = this.utils.getUserId(token);
      return this.notificationsService.fetchSingleNotification(userId, notificationId);
    } else throw new ForbiddenException();
  }

  @Put(':notificationId')
  @UseGuards(TokenGuard)
  updateNotification(
    @Headers('authorization') token: String,
    @Param('notificationId') notificationId: String,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    if(this.utils.isStudent(token) || this.utils.isEmployee(token)) {
      const userId: String = this.utils.getUserId(token);
      return this.notificationsService.updateNotification(userId, notificationId, updateNotificationDto);
    } else throw new ForbiddenException();
  }

  @Post(':notificationId/analytics')
  @UseGuards(TokenGuard)
  createNotificationAnalytic(
    @Headers('authorization') token: String,
    @Param('notificationId') notificationId: String,
    @Query('event', new ParseEnumPipe(NotificationEvent)) event: NotificationEvent,
  ) {
    if(this.utils.isStudent(token) || this.utils.isEmployee(token)) {
      const userId: String = this.utils.getUserId(token);
      return this.notificationsService.registerNotificationsAnalytic(userId, notificationId, event);
    } else throw new ForbiddenException();
  }
}
