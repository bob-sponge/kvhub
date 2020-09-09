/* eslint-disable @typescript-eslint/quotes */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1598421604199 implements MigrationInterface {
  name = 'Migration1598421804199';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "keyid" ON "public"."keyvalue" USING hash ("key_id" "pg_catalog"."int4_ops")`,
      undefined,
    );
    await queryRunner.query(`alter table  "public"."keyvalue" alter  COLUMN  value TYPE varchar(500)`, undefined);
    await queryRunner.query(`alter table  "public"."keyname" alter  COLUMN  name  TYPE varchar(500)`, undefined);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
