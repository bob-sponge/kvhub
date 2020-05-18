import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1589438630357 implements MigrationInterface {
  name = 'Migration1589438630357';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      // eslint-disable-next-line max-len
      'CREATE TABLE "public"."merge_diff_value" ("id" SERIAL NOT NULL, "merge_diff_key_id" integer NOT NULL, "value_id" integer NOT NULL, "branch_id" integer NOT NULL, "language_id" integer NOT NULL, CONSTRAINT "PK_e3c0ad84ee859f0087ec41e358f" PRIMARY KEY ("id"))',
      undefined,
    );
    await queryRunner.query('ALTER TABLE "public"."branch_merge" ADD "modifier" character varying(255)', undefined);
    await queryRunner.query('ALTER TABLE "public"."branch_merge" ADD "modify_time" TIMESTAMP', undefined);
    await queryRunner.query('ALTER TABLE "public"."branch_commit" DROP COLUMN "commit_id"', undefined);
    await queryRunner.query('ALTER TABLE "public"."branch_commit" ADD "commit_id" character varying(255)', undefined);
    await queryRunner.query('ALTER TABLE "public"."branch_merge" DROP COLUMN "commit_id"', undefined);
    await queryRunner.query(
      'ALTER TABLE "public"."branch_merge" ADD "commit_id" character varying(255) NOT NULL',
      undefined,
    );
    await queryRunner.query('ALTER TABLE "public"."keyname" DROP COLUMN "commit_id"', undefined);
    await queryRunner.query(
      'ALTER TABLE "public"."keyname" ADD "commit_id" character varying(255) NOT NULL',
      undefined,
    );
    await queryRunner.query('ALTER TABLE "public"."keyvalue" DROP COLUMN "commit_id"', undefined);
    await queryRunner.query('ALTER TABLE "public"."keyvalue" ADD "commit_id" character varying(255)', undefined);
    await queryRunner.query('ALTER TABLE "public"."merge_diff_key" DROP COLUMN "key"', undefined);
    await queryRunner.query('ALTER TABLE "public"."merge_diff_key" ADD "key" integer NOT NULL', undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "public"."merge_diff_key" DROP COLUMN "key"', undefined);
    await queryRunner.query(
      'ALTER TABLE "public"."merge_diff_key" ADD "key" character varying(255) NOT NULL',
      undefined,
    );
    await queryRunner.query('ALTER TABLE "public"."keyvalue" DROP COLUMN "commit_id"', undefined);
    await queryRunner.query('ALTER TABLE "public"."keyvalue" ADD "commit_id" integer', undefined);
    await queryRunner.query('ALTER TABLE "public"."keyname" DROP COLUMN "commit_id"', undefined);
    await queryRunner.query('ALTER TABLE "public"."keyname" ADD "commit_id" integer NOT NULL', undefined);
    await queryRunner.query('ALTER TABLE "public"."branch_merge" DROP COLUMN "commit_id"', undefined);
    await queryRunner.query('ALTER TABLE "public"."branch_merge" ADD "commit_id" integer NOT NULL', undefined);
    await queryRunner.query('ALTER TABLE "public"."branch_commit" DROP COLUMN "commit_id"', undefined);
    await queryRunner.query('ALTER TABLE "public"."branch_commit" ADD "commit_id" integer NOT NULL', undefined);
    await queryRunner.query('ALTER TABLE "public"."branch_merge" DROP COLUMN "modify_time"', undefined);
    await queryRunner.query('ALTER TABLE "public"."branch_merge" DROP COLUMN "modifier"', undefined);
    await queryRunner.query('DROP TABLE "public"."merge_diff_value"', undefined);
  }
}
