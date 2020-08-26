import {MigrationInterface, QueryRunner} from "typeorm";

export class Migration1598421604199 implements MigrationInterface {
    name = 'Migration1598421604199'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."user" ADD "permission" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "public"."user" DROP COLUMN "admin"`, undefined);
        await queryRunner.query(`ALTER TABLE "public"."user" ADD "admin" integer DEFAULT 1`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."user" DROP COLUMN "admin"`, undefined);
        await queryRunner.query(`ALTER TABLE "public"."user" ADD "admin" character varying(255) NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "public"."user" DROP COLUMN "permission"`, undefined);
    }

}
