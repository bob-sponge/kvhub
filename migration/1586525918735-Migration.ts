import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1586525918735 implements MigrationInterface {
  name = 'Migration1586525918735';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "public"."user" RENAME COLUMN "admin" TO "admin"', undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "public"."user" RENAME COLUMN "admin" TO "admin"', undefined);
  }
}
