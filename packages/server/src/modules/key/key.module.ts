import { Module } from '@nestjs/common';
import { KeyService } from './key.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Key } from 'src/entities/Key';
import { Keyname } from 'src/entities/Keyname';
import { Keyvalue } from 'src/entities/Keyvalue';

@Module({
  imports: [TypeOrmModule.forFeature([Key, Keyname, Keyvalue])],
  providers: [KeyService],
  exports: [KeyService],
})
export class KeyModule {}
