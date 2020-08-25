import { Module } from '@nestjs/common';
import { AppModule as TestModule } from './modules/app/app.module';
import { ConfigModule, ConfigService } from '@ofm/nestjs-utils';
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
import { ProjectModule } from './modules/project/project.module';
import { LanguagesModule } from './modules/languages/languages.module';
import { BranchModule } from './modules/branch/branch.module';
import { KeyModule } from './modules/key/key.module';
import { NamespaceModule } from './modules/namespace/namespace.module';
import { BranchMergeModule } from './modules/branchMerge/branchMerge.module';
import { MergeDiffValue } from './entities/MergeDiffValue';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.register({ dir: '/packages/server/config' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, BranchModule, KeyModule, ProjectModule, LanguagesModule, NamespaceModule, BranchMergeModule, UserModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) =>
        ({
          type: 'postgres',
          host: config.get('database', 'host'),
          port: config.get('database', 'port'),
          username: config.get('database', 'username'),
          password: config.get('database', 'password'),
          database: config.get('database', 'database'),
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
            MergeDiffValue,
            Namespace,
            Project,
            ProjectLanguage,
            User,
          ],
          synchronize: false,
        } as any),
    }),
    TestModule,
  ],
})
export class AppModule {}
