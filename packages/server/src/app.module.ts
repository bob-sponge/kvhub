import { Module } from '@nestjs/common';
import { AppModule as TestModule } from './modules/app/app.module';
import { ConfigModule } from '@ofm/nestjs-utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/User';
import { Branch } from './entities/Branch';
import { BranchCommit } from './entities/BranchCommit';
import { BranchKey } from './entities/BranchKey';
import { BranchMerge } from './entities/BranchMerge';
import { Key } from './entities/Key';
import { Keyname } from './entities/Keyname';
import { Keyvalue } from './entities/Keyvalue';
import { Language } from './entities/Language';
import { MergeDiffChangeKey } from './entities/MergeDiffChangeKey';
import { MergeDiffKey } from './entities/MergeDiffKey';
import { Namespace } from './entities/Namespace';
import { Project } from './entities/Project';
import { ProjectLanguage } from './entities/ProjectLanguage';

@Module({
  imports: [
    ConfigModule.register({ dir: '/packages/server/config' }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123456',
      database: 'i18n',
      entities: [
        Branch,
        BranchCommit,
        BranchKey,
        BranchMerge,
        Key,
        Keyname,
        Keyvalue,
        Language,
        MergeDiffChangeKey,
        MergeDiffKey,
        Namespace,
        Project,
        ProjectLanguage,
        User,
      ],
      synchronize: false,
    }),
    TestModule,
  ],
})
export class AppModule {}
