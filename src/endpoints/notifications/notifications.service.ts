import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, map, Observable } from 'rxjs';
import { UtilsService } from 'src/utils/utils.service';
import { NotificationsDto } from './dto/notifications.dto';
import { UpdateNotificationDto } from './dto/updateNotification.dto';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly http: HttpService,
    private readonly utils: UtilsService,
  ) {}

  /**
   * Fetches the user notifications.
   * @param userId The user id to fetch with.
   * @param options The options to search with.
   * @param options.ignoreDeleted The option to know if the notifications marked as deleted should be ignored. Default `true`.
   * @return An observable with a `NotificationsDto`
   */
  fetchNotifications(userId: string, options: { ignoreDeleted: boolean } = { ignoreDeleted: true }): Observable<NotificationsDto> {
    return this.http.get<[]>(`/pnsys/1.0.0/users/${userId}/notifications?ignoreDeleted=${options.ignoreDeleted}`)
    .pipe(
      map(({data}) => {
        const notifications: Notification[] = data.map(unformattedNotifications => this.mapNotification(unformattedNotifications));
        return {quantity: notifications.length, notifications};
      }),
      catchError(this.utils.handleHttpError<NotificationsDto>({quantity: 0, notifications: []})),
    );
  }

  /**
   * Fetches a single user notification.
   * @param userId The user id to fetch with.
   * @param notificationId The notification id to find.
   * @param options The options to search with.
   * @param options.ignoreDeleted The option to know if the notification should be ignored if is marked as deleted. Default `true`.
   * @return An observable with a `Notification`
   */
  fetchSingleNotification(userId: string, notificationId: string, options: { ignoreDeleted: boolean } = { ignoreDeleted: true }): Observable<Notification> {
    return this.http.get<{}>(`/pnsys/1.0.0/users/${userId}/notifications/${notificationId}?ignoreDeleted=${options.ignoreDeleted}`)
    .pipe(
      map(({data}) => this.mapNotification(data)),
      catchError(this.utils.handleHttpError<Notification>(new Notification(), { messageIfNotFound: `Notification ${notificationId} not found for user ${userId}`})),
    );
  }

  /**
   * Update a single user notification.
   * @param userId The user id to fetch with.
   * @param notificationId The notification id to find.
   * @return An observable with an updated `Notification`
   */
  updateNotification(userId: string, notificationId: string, updateNotificationDto: UpdateNotificationDto): Observable<Notification> {
    return this.http.put<{}>(`/pnsys/1.0.0/users/${userId}/notifications/${notificationId}`, updateNotificationDto)
    .pipe(
      map(({data}) => this.mapNotification(data)),
      catchError(this.utils.handleHttpError<Notification>(new Notification(), {
        messageIfNotFound: `Notification ${notificationId} not found for user ${userId}`,
      })),
    );
  }

  /**
   * Save analytics to a user notification.
   * 
   * Receives an `UpdateNotificationDto` but some fields are deleted from the object, like `seen` or `delete`, because are also logical fields and not only analytics.
   * @param userId The user id to fetch with.
   * @param notificationId The notification id to update.
   * @param analytics The notification analytics.
   * @return A void observable
   */
  saveAnalytics(userId: string, notificationId: string, analytics: UpdateNotificationDto): Observable<void> {
    // Delete fields that aren't analytics
    // This allow us to reuse `updateNotification` with `UpdateNotificationDto`
    delete analytics.deleted;
    delete analytics.seen;

    return this.updateNotification(userId, notificationId, analytics)
    .pipe(
      map(() => undefined),
      catchError(this.utils.handleHttpError<void>(undefined, {
        messageIfNotFound: `Notification ${notificationId} not found for user ${userId}`,
      })),
    );
  }

  /**
   * Map a Notification from the response data.
   * @param data The response data
   * @returns A mapped `Notification`
   */
  private mapNotification = (data: any): Notification => ({
    id: data['content']['id'],
    content: {
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
    createAt: new Date(data['content']['createdAt']),
    seen: data['seen'] ? new Date(data['seen']) : undefined,
    received: data['received'] ? new Date(data['received']) : undefined,
    deleted: data['deleted'] ? new Date(data['deleted']) : undefined,
  });
}
