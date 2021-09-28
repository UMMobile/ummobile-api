export enum NotificationEvent {
  received, clicked,
}

export class Notification {
  id: String;
  content: NotificationContent;
  seen?: Date;
  deleted?: Date;
}

class NotificationContent {
  sender: String;
  message: NotificationMessage;
  createAt: Date;
  updatedAt: Date;
}

class NotificationMessage {
  push_heading?: NotificationMessageTr;
  push_content?: NotificationMessageTr;
  heading: NotificationMessageTr;
  content: NotificationMessageTr;
}

class NotificationMessageTr {
  en: String;
  es: String;
}
