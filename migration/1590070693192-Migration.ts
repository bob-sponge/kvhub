import {MigrationInterface, QueryRunner} from "typeorm";

export class Migration1590070693192 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."merge_diff_key" alter column "select_branch_id" drop not null`, undefined);
        await queryRunner.query(`ALTER TABLE "public"."merge_diff_value" alter column "branch_id" drop not null`, undefined);
        await queryRunner.query(`ALTER TABLE "public"."keyname" alter column "commit_id" drop not null`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."merge_diff_key" alter column "select_branch_id" set NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "public"."merge_diff_value" alter column "branch_id" set NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "public"."keyname" alter column "commit_id" set not null`, undefined);
    }

}
