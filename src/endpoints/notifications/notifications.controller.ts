import { Controller, Get, Body, Param, UseGuards, Headers, ForbiddenException, Query, Patch, ParseBoolPipe, DefaultValuePipe, UnprocessableEntityException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UpdateNotificationDto } from './dto/updateNotification.dto';
import { UtilsService } from 'src/utils/utils.service';
import { TokenGuard } from 'src/services/guards/token.guard';
import { Notification } from './entities/notification.entity';
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
  @ApiQuery({
    name: 'ignoreDeleted',
    description: '`false` to ignore notifications marked as deleted & `true` to include them in the response.',
    required: false,
    schema: {
      default: true,
      type: 'boolean',
    }
  })
  @Get()
  @UseGuards(TokenGuard)
  getNotifications(
    @Headers() headers: any,
    @Query('ignoreDeleted', new DefaultValuePipe(true), ParseBoolPipe) ignoreDeleted: boolean,
  ): Observable<NotificationsDto> {
    if(this.utils.isStudent(headers['Authorization']) || this.utils.isEmployee(headers['Authorization'])) {
      const userId: string = this.utils.getUserId(headers['Authorization']);
      return this.notificationsService.fetchNotifications(userId, { ignoreDeleted });
    } else throw new ForbiddenException();
  }

  @ApiOperation({summary: "Fetches a single user notification"})
  @ApiParam({
    name: 'notificationId',
    description: 'The notification id.',
  })
  @ApiQuery({
    name: 'ignoreDeleted',
    description: '`false` to ignore notifications marked as deleted & `true` to include them in the response.',
    required: false,
    schema: {
      default: true,
      type: 'boolean',
    }
  })
  @Get(':notificationId')
  @UseGuards(TokenGuard)
  getSingleNotification(
    @Headers() headers: any,
    @Param('notificationId') notificationId: string,
    @Query('ignoreDeleted', new DefaultValuePipe(true), ParseBoolPipe) ignoreDeleted: boolean,
  ): Observable<Notification> {
    if(this.utils.isStudent(headers['Authorization']) || this.utils.isEmployee(headers['Authorization'])) {
      console.log(ignoreDeleted);
      const userId: string = this.utils.getUserId(headers['Authorization']);
      return this.notificationsService.fetchSingleNotification(userId, notificationId, { ignoreDeleted });
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
    description: "Saves a new analytic event like `received`.",
  })
  @ApiParam({
    name: 'notificationId',
    description: 'The notification id.',
  })
  @Patch(':notificationId/analytics')
  @UseGuards(TokenGuard)
  saveNotificationAnalytics(
    @Headers() headers: any,
    @Param('notificationId') notificationId: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ): Observable<void> {
    // The `received` field is mandatory for this controller because is the only field that is only analytic.
    // Other fields are also logical and are updated with `updateNotification` controller.
    if(!updateNotificationDto.received)
      throw new UnprocessableEntityException();
    
    if(this.utils.isStudent(headers['Authorization']) || this.utils.isEmployee(headers['Authorization'])) {
      const userId: string = this.utils.getUserId(headers['Authorization']);
      return this.notificationsService.saveAnalytics(userId, notificationId, updateNotificationDto);
    } else throw new ForbiddenException();
  }
}
