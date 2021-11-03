export enum NotificationEvent {
  received = 'received',
  clicked = 'clicked',
}

export class Notification {
  id: string;
  content: NotificationMessage;
  seen?: Date;
  deleted?: Date;
  received?: Date;
  createAt: Date;
}

class NotificationMessage {
  push_heading?: NotificationMessageTr;
  push_content?: NotificationMessageTr;
  heading: NotificationMessageTr;
  content: NotificationMessageTr;
}

class NotificationMessageTr {
  en: string;
  es: string;
}
