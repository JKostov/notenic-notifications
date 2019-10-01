import { Inject, Injectable } from '@nestjs/common';
import { IConfigService } from '@app/shared/config/interfaces/config.service.interface';
import { MongooseOptionsFactory, MongooseModuleOptions } from '@nestjs/mongoose';

@Injectable()
export class DatabaseFactory implements MongooseOptionsFactory {

  constructor(@Inject('IConfigService') private configService: IConfigService) { }

  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: this.configService.get('MONGO_URL'),
      useNewUrlParser: true,
    };
  }
}
