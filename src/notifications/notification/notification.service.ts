import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from '@notifications//notification/notification.model';
import { CreateNotificationDto } from '@notifications//notification/dto/create-notification.dto';

@Injectable()
export class NotificationService {
  constructor(@InjectModel('Notification') private readonly notificationModel: Model<Notification>) { }

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const createdNotification = new this.notificationModel(createNotificationDto);
    return await createdNotification.save();
  }

  async createMany(notifications: CreateNotificationDto[]): Promise<Notification[]> {
    return await this.notificationModel.insertMany(notifications);
  }

  async seenAll(userId: string): Promise<void> {
    await this.notificationModel.updateMany({ recipient: userId, seen: false }, { seen: true });
  }

  async haveUnseen(userId: string): Promise<boolean> {
    const num = await this.notificationModel.count({ recipient: userId, seen: false }).exec();

    return num > 0;
  }

  async findForUser(userId: string): Promise<Notification[]> {
    let limit = await this.notificationModel.count({ recipient: userId, seen: false }).exec();

    if (limit < 10) {
      limit = 3;
    }

    return await this.notificationModel.find({ recipient: userId }, null, {
      skip: 0,
      limit,
      sort: {
        createdAt: -1,
      },
    }).exec();
  }
}
