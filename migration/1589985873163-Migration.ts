import {MigrationInterface, QueryRunner} from "typeorm";

export class Migration1589985873163 implements MigrationInterface {
    name = 'Migration1589985873163'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."merge_diff_value" ADD "key_id" integer NOT NULL`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."merge_diff_value" DROP COLUMN "key_id"`, undefined);
    }

}
