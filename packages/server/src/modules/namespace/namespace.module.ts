import { Module } from '@nestjs/common';
import { NamespaceController } from './namespace.controller';
import { NamespaceService } from './namespace.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Namespace } from 'src/entities/Namespace';
import { Keyvalue } from 'src/entities/Keyvalue';

@Module({
  imports: [TypeOrmModule.forFeature([Namespace, Keyvalue])],
  controllers: [NamespaceController],
  providers: [NamespaceService],
  exports: [NamespaceService],
})
export class NamespaceModule {}
