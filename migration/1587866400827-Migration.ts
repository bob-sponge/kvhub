import {MigrationInterface, QueryRunner} from "typeorm";

export class Migration1587866400827 implements MigrationInterface {
    name = 'Migration1587866400827'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "public"."branch" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "project_id" integer NOT NULL, "master" boolean NOT NULL, "modifier" character varying(255), "modify_time" TIMESTAMP, CONSTRAINT "PK_b1c2250c2fb34e52e025346d6eb" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "public"."branch_commit" ("id" SERIAL NOT NULL, "branch_id" integer NOT NULL, "commit_id" integer NOT NULL, "commit_time" TIMESTAMP NOT NULL, "type" character varying(255) NOT NULL, CONSTRAINT "PK_343bb2128ce4d79bdec6f8e3e0c" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "public"."branch_key" ("id" SERIAL NOT NULL, "branch_id" integer NOT NULL, "key_id" integer NOT NULL, "delete" boolean NOT NULL, CONSTRAINT "PK_6da5e3feb815105a68892fab650" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "public"."branch_merge" ("id" SERIAL NOT NULL, "source_branch_id" integer, "target_branch_id" integer NOT NULL, "cros_merge" boolean, "type" character varying(255) NOT NULL, "commit_id" integer NOT NULL, CONSTRAINT "PK_08f19662a698551b423aa7bbda1" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "public"."key" ("id" SERIAL NOT NULL, "actual_id" integer NOT NULL, "namespace_id" integer, "modifier" character varying(255), "modify_time" TIMESTAMP, "delete" boolean, CONSTRAINT "PK_d62252a04e5f1e6cecc6b0ef4fb" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "public"."keyname" ("id" SERIAL NOT NULL, "key_id" integer NOT NULL, "name" character varying(255) NOT NULL, "modifier" character varying(255), "modify_time" TIMESTAMP, "commit_id" integer NOT NULL, CONSTRAINT "PK_068efcb07b7f1a4756b1b7ed825" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "public"."keyvalue" ("id" SERIAL NOT NULL, "value" character varying(255) NOT NULL, "key_id" integer NOT NULL, "language_id" integer NOT NULL, "merge_id" integer, "commit_id" integer, "modifier" character varying(255), "midify_time" TIMESTAMP, "latest" boolean, CONSTRAINT "PK_0940337e6dfd377dbc5e4c317fd" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "public"."language" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, CONSTRAINT "PK_b1678c612b1e8b66f3b45aacc66" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "public"."merge_diff_change_key" ("id" SERIAL NOT NULL, "merge_id" integer NOT NULL, "branch_id" integer NOT NULL, "key" character varying(255) NOT NULL, "language" character varying(255) NOT NULL, "value" character varying(255) NOT NULL, "modifier" character varying(255), "modify_time" TIMESTAMP, CONSTRAINT "PK_bc57d64b7feb9a5a4630fee5c5d" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "public"."merge_diff_key" ("id" SERIAL NOT NULL, "merge_id" integer NOT NULL, "key" character varying(255) NOT NULL, "select_branch_id" integer NOT NULL, CONSTRAINT "PK_b93d285fe38f010919d04ec3735" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "public"."namespace" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "project_id" integer NOT NULL, "modifier" character varying(255), "modify_time" TIMESTAMP, "delete" boolean, "type" character varying(255) NOT NULL, CONSTRAINT "PK_7cc4d2f415fc19d4126bf0fe1ca" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "public"."project" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "reference_language_id" character varying NOT NULL, "modifier" character varying(255), "modify_time" TIMESTAMP, "delete" boolean NOT NULL, "type" character varying(255) NOT NULL, CONSTRAINT "PK_f648594d8d54cf65d99b2c10fa5" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "public"."project_language" ("id" SERIAL NOT NULL, "project_id" integer NOT NULL, "language_id" integer NOT NULL, "modifier" character varying(255), "modify_time" TIMESTAMP, "delete" boolean NOT NULL, CONSTRAINT "PK_05c4f41599518dd3dfc8aebd41b" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "public"."user" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "department" character varying(255), "type" character varying(255), "admin" character varying(255) NOT NULL, CONSTRAINT "PK_03b91d2b8321aa7ba32257dc321" PRIMARY KEY ("id"))`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "public"."user"`, undefined);
        await queryRunner.query(`DROP TABLE "public"."project_language"`, undefined);
        await queryRunner.query(`DROP TABLE "public"."project"`, undefined);
        await queryRunner.query(`DROP TABLE "public"."namespace"`, undefined);
        await queryRunner.query(`DROP TABLE "public"."merge_diff_key"`, undefined);
        await queryRunner.query(`DROP TABLE "public"."merge_diff_change_key"`, undefined);
        await queryRunner.query(`DROP TABLE "public"."language"`, undefined);
        await queryRunner.query(`DROP TABLE "public"."keyvalue"`, undefined);
        await queryRunner.query(`DROP TABLE "public"."keyname"`, undefined);
        await queryRunner.query(`DROP TABLE "public"."key"`, undefined);
        await queryRunner.query(`DROP TABLE "public"."branch_merge"`, undefined);
        await queryRunner.query(`DROP TABLE "public"."branch_key"`, undefined);
        await queryRunner.query(`DROP TABLE "public"."branch_commit"`, undefined);
        await queryRunner.query(`DROP TABLE "public"."branch"`, undefined);
    }

}
