import {MigrationInterface, QueryRunner} from "typeorm";

export class Migration1592481185837 implements MigrationInterface {
    name = 'Migration1592481185837'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."branch_merge" ADD "project_id" integer NOT NULL`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."branch_merge" DROP COLUMN "project_id"`, undefined);
    }

}
