import {MigrationInterface, QueryRunner} from "typeorm";

export class Migration1601359177758 implements MigrationInterface {
    name = 'Migration1601359177758'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."keyid"`);
        await queryRunner.query(`ALTER TABLE "public"."branch" ADD "delete" boolean`);
        await queryRunner.query(`ALTER TABLE "public"."keyname" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "public"."keyname" ADD "name" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."keyname" ALTER COLUMN "commit_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."keyname" ALTER COLUMN "latest" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."keyvalue" DROP COLUMN "value"`);
        await queryRunner.query(`ALTER TABLE "public"."keyvalue" ADD "value" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."merge_diff_key" ALTER COLUMN "select_branch_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."merge_diff_value" ALTER COLUMN "branch_id" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."merge_diff_value" ALTER COLUMN "branch_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."merge_diff_key" ALTER COLUMN "select_branch_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."keyvalue" DROP COLUMN "value"`);
        await queryRunner.query(`ALTER TABLE "public"."keyvalue" ADD "value" character varying(500) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."keyname" ALTER COLUMN "latest" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "public"."keyname" ALTER COLUMN "commit_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."keyname" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "public"."keyname" ADD "name" character varying(500) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."branch" DROP COLUMN "delete"`);
        await queryRunner.query(`CREATE INDEX "keyid" ON "public"."keyvalue" ("key_id") `);
    }

}
