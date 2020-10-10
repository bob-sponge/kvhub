/* eslint-disable @typescript-eslint/quotes */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1601367438711 implements MigrationInterface {
  name = 'Migration1601367438711';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."keyid"`);
    await queryRunner.query(`ALTER TABLE "public"."keyname" ALTER COLUMN "commit_id" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "public"."keyvalue" ALTER COLUMN "latest" SET DEFAULT true`);
    await queryRunner.query(`ALTER TABLE "public"."merge_diff_key" ALTER COLUMN "select_branch_id" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "public"."merge_diff_value" ALTER COLUMN "branch_id" SET NOT NULL`);
    await queryRunner.query(`CREATE INDEX "IDX_d62252a04e5f1e6cecc6b0ef4f" ON "public"."key" ("id") `);
    await queryRunner.query(`CREATE INDEX "IDX_d0549778f9f925ee1249f0f519" ON "public"."keyvalue" ("key_id") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_d0549778f9f925ee1249f0f519"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d62252a04e5f1e6cecc6b0ef4f"`);
    await queryRunner.query(`ALTER TABLE "public"."merge_diff_value" ALTER COLUMN "branch_id" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "public"."merge_diff_key" ALTER COLUMN "select_branch_id" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "public"."keyvalue" ALTER COLUMN "latest" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "public"."keyname" ALTER COLUMN "commit_id" DROP NOT NULL`);
    await queryRunner.query(`CREATE INDEX "keyid" ON "public"."keyvalue" ("key_id") `);
  }
}
