import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1593396436519 implements MigrationInterface {
  name = 'Migration1593396436519';
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      // eslint-disable-next-line @typescript-eslint/quotes
      `ALTER TABLE "public"."project" alter COLUMN reference_language_id type integer USING (trim(reference_language_id)::integer);`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      // eslint-disable-next-line @typescript-eslint/quotes
      `ALTER TABLE "public"."project" alter COLUMN reference_language_id type integer USING (trim(reference_language_id)::integer);`,
      undefined,
    );
  }
}
