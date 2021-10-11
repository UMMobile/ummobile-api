import { Controller, Get, Post, Body, Param, UseGuards, Headers, ForbiddenException, Query, ParseEnumPipe, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UpdateNotificationDto } from './dto/updateNotification.dto';
import { UtilsService } from 'src/utils/utils.service';
import { TokenGuard } from 'src/services/guards/token.guard';
import { Notification, NotificationEvent } from './entities/notification.entity';
import { ApiBearerAuth, ApiForbiddenResponse, ApiOperation, ApiParam, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { NotificationsDto } from './dto/notifications.dto';

@ApiBearerAuth()
@ApiUnauthorizedResponse({description: 'Unauthorized if header does not contains user access token.'})
@ApiForbiddenResponse({description: 'Forbidden if is neither a student, teacher or valid token.'})
@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly utils: UtilsService,
  ) {}

  @ApiOperation({summary: "Fetches the user notifications"})
  @Get()
  @UseGuards(TokenGuard)
  getNotifications(@Headers() headers: any): Observable<NotificationsDto> {
    if(this.utils.isStudent(headers['Authorization']) || this.utils.isEmployee(headers['Authorization'])) {
      const userId: string = this.utils.getUserId(headers['Authorization']);
      return this.notificationsService.fetchNotifications(userId);
    } else throw new ForbiddenException();
  }

  @ApiOperation({summary: "Fetches a single user notification"})
  @ApiParam({
    name: 'notificationId',
    description: 'The notification id.',
  })
  @Get(':notificationId')
  @UseGuards(TokenGuard)
  getSingleNotification(
    @Headers() headers: any,
    @Param('notificationId') notificationId: string,
  ): Observable<Notification> {
    if(this.utils.isStudent(headers['Authorization']) || this.utils.isEmployee(headers['Authorization'])) {
      const userId: string = this.utils.getUserId(headers['Authorization']);
      return this.notificationsService.fetchSingleNotification(userId, notificationId);
    } else throw new ForbiddenException();
  }

  @ApiOperation({
    summary: "Updates an user notification",
    description: "Marks as `seen` or `deleted` an specific user notification.",
  })
  @ApiParam({
    name: 'notificationId',
    description: 'The notification id.',
  })
  @Patch(':notificationId')
  @UseGuards(TokenGuard)
  updateNotification(
    @Headers() headers: any,
    @Param('notificationId') notificationId: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ): Observable<Notification> {
    if(this.utils.isStudent(headers['Authorization']) || this.utils.isEmployee(headers['Authorization'])) {
      const userId: string = this.utils.getUserId(headers['Authorization']);
      return this.notificationsService.updateNotification(userId, notificationId, updateNotificationDto);
    } else throw new ForbiddenException();
  }

  @ApiOperation({
    summary: "Saves an user notification analytic event",
    description: "Saves a new analytic event like `received` or `clicked`.",
  })
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
    @Headers() headers: any,
    @Param('notificationId') notificationId: string,
    @Query('event', new ParseEnumPipe(NotificationEvent)) event: NotificationEvent,
  ): Observable<void> {
    if(this.utils.isStudent(headers['Authorization']) || this.utils.isEmployee(headers['Authorization'])) {
      const userId: string = this.utils.getUserId(headers['Authorization']);
      return this.notificationsService.registerNotificationsAnalytic(userId, notificationId, event);
    } else throw new ForbiddenException();
  }
}
