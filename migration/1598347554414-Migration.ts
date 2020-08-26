import {MigrationInterface, QueryRunner} from "typeorm";

export class Migration1598347554414 implements MigrationInterface {
    name = 'Migration1598347554414'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."user" ADD "password" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "public"."user" ADD "last_time" TIMESTAMP`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."user" DROP COLUMN "last_time"`, undefined);
        await queryRunner.query(`ALTER TABLE "public"."user" DROP COLUMN "password"`, undefined);
    }

}
