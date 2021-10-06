import { Controller, Get, Post, Body, Param, UseGuards, Headers, ForbiddenException, Put, Query, ParseEnumPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UpdateNotificationDto } from './dto/updateNotification.dto';
import { UtilsService } from 'src/utils/utils.service';
import { TokenGuard } from 'src/services/guards/token.guard';
import { Notification, NotificationEvent } from './entities/notification.entity';
import { ApiBearerAuth, ApiForbiddenResponse, ApiHeader, ApiParam, ApiQuery, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { NotificationsDto } from './dto/notifications.dto';

@ApiBearerAuth()
@ApiHeader({
  name: 'authorization',
  description: 'Override the endpoint auth. Is required if endpoint is not authenticated and will return 401.',
  required: false,
})
@ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized if header does not contains user access token.'})
@ApiForbiddenResponse({ status: 403, description: 'Forbidden if is neither a student, teacher or valid token.'})
@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly utils: UtilsService,
  ) {}

  @Get()
  @UseGuards(TokenGuard)
  getNotifications(@Headers('authorization') token: String): Observable<NotificationsDto> {
    if(this.utils.isStudent(token) || this.utils.isEmployee(token)) {
      const userId: string = this.utils.getUserId(token);
      return this.notificationsService.fetchNotifications(userId);
    } else throw new ForbiddenException();
  }

  @ApiParam({
    name: 'notificationId',
    description: 'The notification id.',
  })
  @Get(':notificationId')
  @UseGuards(TokenGuard)
  getSingleNotification(
    @Headers('authorization') token: String,
    @Param('notificationId') notificationId: string,
  ): Observable<Notification> {
    if(this.utils.isStudent(token) || this.utils.isEmployee(token)) {
      const userId: string = this.utils.getUserId(token);
      return this.notificationsService.fetchSingleNotification(userId, notificationId);
    } else throw new ForbiddenException();
  }

  @ApiParam({
    name: 'notificationId',
    description: 'The notification id.',
  })
  @Put(':notificationId')
  @UseGuards(TokenGuard)
  updateNotification(
    @Headers('authorization') token: String,
    @Param('notificationId') notificationId: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ): Observable<Notification> {
    if(this.utils.isStudent(token) || this.utils.isEmployee(token)) {
      const userId: string = this.utils.getUserId(token);
      return this.notificationsService.updateNotification(userId, notificationId, updateNotificationDto);
    } else throw new ForbiddenException();
  }

  @ApiParam({
    name: 'notificationId',
    description: 'The notification id.',
  })
  @ApiQuery({
    name: 'event',
    description: 'The notification event.',
    enum: NotificationEvent,
  })
  @Post(':notificationId/analytics')
  @UseGuards(TokenGuard)
  createNotificationAnalytic(
    @Headers('authorization') token: String,
    @Param('notificationId') notificationId: string,
    @Query('event', new ParseEnumPipe(NotificationEvent)) event: NotificationEvent,
  ): Observable<void> {
    if(this.utils.isStudent(token) || this.utils.isEmployee(token)) {
      const userId: string = this.utils.getUserId(token);
      return this.notificationsService.registerNotificationsAnalytic(userId, notificationId, event);
    } else throw new ForbiddenException();
  }
}
