import { Controller, Get, HttpStatus, Req, Res, UseGuards } from '@nestjs/common';
import { NotificationService } from '@notifications//notification/notification.service';
import { LoggedGuard } from '@app/shared/guards/logged.guard';
import { CreateNotificationDto } from '@notifications//notification/dto/create-notification.dto';
import { EventPattern } from '@nestjs/microservices';
import { NotificationGateway } from '@notifications//gateways/notification.gateway';

@Controller('notifications')
export class NotificationController {

  constructor(private readonly notificationService: NotificationService, private notificationGateway: NotificationGateway) { }

  @Get('user')
  @UseGuards(LoggedGuard)
  public async getNotificationForUser(@Req() req, @Res() res) {
    const user = req.user;
    const notifications = await this.notificationService.findForUser(user.id);

    return res.status(HttpStatus.OK).json(notifications);
  }

  @Get('user/seen')
  @UseGuards(LoggedGuard)
  public async seenAllNotifications(@Req() req, @Res() res) {
    const user = req.user;
    await this.notificationService.seenAll(user.id);

    return res.status(HttpStatus.OK).json({ success: true });
  }

  @EventPattern('liked_note')
  async handleUserLikedNote(data: { recipient: string, userId: string, note: { username: string, title: string } }) {
    const createNot = new CreateNotificationDto();
    createNot.userId = data.userId;
    createNot.note = data.note;
    createNot.action = 'liked your note ';
    createNot.recipient = data.recipient;

    if (createNot.userId !== createNot.recipient) {
      const notification = await this.notificationService.create(createNot);
      this.notificationGateway.server.to(notification.recipient).emit('new-notification', notification);
    }
  }

  @EventPattern('commented_note')
  async handleUserCommentedNote(data: { recipient: string, userId: string, note: { username: string, title: string } }) {
    const createNot = new CreateNotificationDto();
    createNot.userId = data.userId;
    createNot.note = data.note;
    createNot.action = 'commented on your note ';
    createNot.recipient = data.recipient;

    if (createNot.userId !== createNot.recipient) {
      const notification = await this.notificationService.create(createNot);
      this.notificationGateway.server.to(notification.recipient).emit('new-notification', notification);
    }
  }

  @EventPattern('published_note')
  async handleUserPublishedNote(data: { recipients: string[], userId: string, note: { username: string, title: string } }) {
    const notifications = data.recipients.map(r => {
      const createNotificationDto = new CreateNotificationDto();
      createNotificationDto.recipient = r;
      createNotificationDto.userId = data.userId;
      createNotificationDto.action = 'published new note ';
      createNotificationDto.note = {
        title: data.note.title,
        username: data.note.username,
      };

      return createNotificationDto;
    });

    const nots = await this.notificationService.createMany(notifications);

    nots.forEach(notification => {
      this.notificationGateway.server.to(notification.recipient).emit('new-notification', notification);
    });
  }

  @EventPattern('created_collaboration')
  async handleUserCreatedCollaboration(data: { recipients: string[], userId: string, note: { username: string, title: string } }) {
    const notifications = data.recipients.map(r => {
      const createNotificationDto = new CreateNotificationDto();
      createNotificationDto.recipient = r;
      createNotificationDto.userId = data.userId;
      createNotificationDto.action = 'invited you to collaborate';
      createNotificationDto.note = null;

      return createNotificationDto;
    });

    const nots = await this.notificationService.createMany(notifications);

    nots.forEach(notification => {
      this.notificationGateway.server.to(notification.recipient).emit('new-notification', notification);
    });
  }

  @EventPattern('user_followed')
  async handleUserFollowed(data: { recipient: string, userId: string, note: { username: string, title: string } }) {
    const createNot = new CreateNotificationDto();
    createNot.userId = data.userId;
    createNot.note = null;
    createNot.action = 'started following you';
    createNot.recipient = data.recipient;
    const notification = await this.notificationService.create(createNot);

    this.notificationGateway.server.to(notification.recipient).emit('new-notification', notification);
  }
}
