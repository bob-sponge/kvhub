/* eslint-disable @typescript-eslint/quotes */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1598421904199 implements MigrationInterface {
  name = 'Migration1598421904199';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "public"."keyname" ADD "latest" boolean`, undefined);
    await queryRunner.query(`ALTER TABLE "public"."keyname" ALTER COLUMN "latest" SET DEFAULT true`, undefined);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
