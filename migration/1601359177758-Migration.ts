/* eslint-disable @typescript-eslint/quotes */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1601359177758 implements MigrationInterface {
  name = 'Migration1601359177758';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "public"."branch" ADD "delete" boolean');
    await queryRunner.query(`ALTER TABLE "public"."branch" ALTER COLUMN "delete" SET DEFAULT false`, undefined);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
