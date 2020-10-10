import {MigrationInterface, QueryRunner} from "typeorm";

export class Migration1602298940126 implements MigrationInterface {
    name = 'Migration1602298940126'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."merge_diff_key" ALTER COLUMN "select_branch_id" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."merge_diff_key" ALTER COLUMN "select_branch_id" SET NOT NULL`);
    }

}
