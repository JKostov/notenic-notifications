import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '@app/shared/shared.module';
import { DatabaseFactory } from '@notifications//database/database.factory';

@Module({
  imports: [MongooseModule.forRootAsync({
    imports: [SharedModule],
    useClass: DatabaseFactory,
  })],
})
export class DatabaseModule {}
