import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, map, Observable } from 'rxjs';
import { UtilsService } from 'src/utils/utils.service';
import { UpdateNotificationDto } from './dto/updateNotification.dto';
import { Notification, NotificationEvent } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly http: HttpService,
    private readonly utils: UtilsService,
  ) {}

  /**
   * Fetches the user notifications.
   * @param userId The user id to fetch with.
   * @return An observable with a list of notifications
   */
  fetchNotifications(userId: String): Observable<{quantity: number, notifications: Notification[]}> {
    return this.http.get<[]>(`/pnsys/1.0.0/users/${userId}/notifications`)
    .pipe(
      map(({data}) => {
        const notifications: Notification[] = data.map(unformattedNotifications => this.mapNotification(unformattedNotifications));
        return {quantity: notifications.length, notifications};
      }),
      catchError(this.utils.handleHttpError<{quantity: number, notifications: Notification[]}>({quantity: 0, notifications: []})),
    );
  }

  /**
   * Fetches a single user notification.
   * @param userId The user id to fetch with.
   * @param notificationId The notification id to find.
   * @return An observable with the notification
   */
  fetchSingleNotification(userId: String, notificationId: String): Observable<Notification> {
    return this.http.get<{}>(`/pnsys/1.0.0/users/${userId}/notifications/${notificationId}`)
    .pipe(
      map(({data}) => this.mapNotification(data)),
      catchError(this.utils.handleHttpError<Notification>(new Notification())),
    );
  }

  /**
   * Update a single user notification.
   * @param userId The user id to fetch with.
   * @param notificationId The notification id to find.
   * @return An observable with the updated notification
   */
  updateNotification(userId: String, notificationId: String, updateNotificationDto: UpdateNotificationDto): Observable<Notification> {
    return this.http.put<{}>(`/pnsys/1.0.0/users/${userId}/notifications/${notificationId}`, updateNotificationDto)
    .pipe(
      map(({data}) => this.mapNotification(data)),
      catchError(this.utils.handleHttpError<Notification>(new Notification(), {
        messageIfNotFound: `Notification ${notificationId} not found for user ${userId}`,
      })),
    );
  }

  /**
   * Registe a the user notification analytics
   * @param userId The user id to fetch with.
   * @return An void observable
   */
  registerNotificationsAnalytic(userId: String, notificationId: String, event: NotificationEvent): Observable<void> {
    return this.http.post<[]>(`/pnsys/1.0.0/analytics`, {notificationId, userId, event})
    .pipe(
      map(() => undefined),
      catchError(this.utils.handleHttpError<void>(undefined, {
        messageIfNotFound: `Notification ${notificationId} not found for user ${userId}`,
      })),
    );
  }

  private mapNotification = (data: any): Notification => ({
    id: data['content']['id'],
    content: {
      createAt: new Date(data['content']['createdAt']),
      updatedAt: new Date(data['content']['updatedAt']),
      sender: data['content']['sender'],
      message: {
        push_heading: data['content']['message']['push_heading'] ? {
          en: data['content']['message']['push_heading']['en'],
          es: data['content']['message']['push_heading']['es'],
        } : undefined,
        push_content: data['content']['message']['push_content'] ? {
          en: data['content']['message']['push_content']['en'],
          es: data['content']['message']['push_content']['es'],
        } : undefined,
        heading: {
          en: data['content']['message']['heading']['en'],
          es: data['content']['message']['heading']['es'],
        },
        content: {
          en: data['content']['message']['content']['en'],
          es: data['content']['message']['content']['es'],
        },
      },
    },
    seen: new Date(data['seen']),
  });
}
