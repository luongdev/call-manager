import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1713424432545 implements MigrationInterface {
    name = 'Init1713424432545'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tenants" ("id" character varying(36) NOT NULL, "name" character varying(255) NOT NULL, "enabled" character varying(255) NOT NULL, CONSTRAINT "PK_a52d08338de77876bc749e3bb39" PRIMARY KEY ("id", "name", "enabled"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tenants"`);
    }

}
