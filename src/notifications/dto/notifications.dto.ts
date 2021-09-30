import { Notification } from "../entities/notification.entity";

export class NotificationsDto {
  quantity: number;
  notifications: Notification[];
}