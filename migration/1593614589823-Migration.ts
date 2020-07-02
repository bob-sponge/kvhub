import {MigrationInterface, QueryRunner} from "typeorm";

export class Migration1593614589823 implements MigrationInterface {
    name = 'Migration1593614589823'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."project" DROP COLUMN "reference_language_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "public"."project" ADD "reference_language_id" integer NOT NULL`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."project" DROP COLUMN "reference_language_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "public"."project" ADD "reference_language_id" character varying NOT NULL`, undefined);
    }

}
