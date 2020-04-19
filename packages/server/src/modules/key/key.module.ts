import { Module } from '@nestjs/common';
import { KeyService } from './key.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Key } from 'src/entities/Key';

@Module({
  imports: [TypeOrmModule.forFeature([Key])],
  providers: [KeyService],
  exports: [KeyService],
})
export class KeyModule {}
