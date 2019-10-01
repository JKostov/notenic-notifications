
export class Notification {
  id: string;
  recipient: string;
  userId: string;
  action: string;
  note: string;
  seen: boolean;
  createdAt: Date;
  updatedAt: Date;
}
