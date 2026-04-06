import { MigrationInterface, QueryRunner } from "typeorm";

export class UserNumber1770568980008 implements MigrationInterface {
    name = 'UserNumber1770568980008'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_stables" ("user_id" uuid NOT NULL, "stable_id" uuid NOT NULL, CONSTRAINT "PK_5d47e583cb9a717004782756ccf" PRIMARY KEY ("user_id", "stable_id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "user_number" character varying(6) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_83814de7a8048e0b591d24d017c" UNIQUE ("user_number")`);
        await queryRunner.query(`ALTER TABLE "contact_persons" ADD "user_id" uuid`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_users_user_number" ON "users" ("user_number") `);
        await queryRunner.query(`ALTER TABLE "user_stables" ADD CONSTRAINT "FK_0f378ff8f06b58de927d1f13e8a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_stables" ADD CONSTRAINT "FK_b9509c5e082b4f48f089a8fab22" FOREIGN KEY ("stable_id") REFERENCES "stables"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contact_persons" ADD CONSTRAINT "FK_b01719907f8661ae034e146ce18" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contact_persons" DROP CONSTRAINT "FK_b01719907f8661ae034e146ce18"`);
        await queryRunner.query(`ALTER TABLE "user_stables" DROP CONSTRAINT "FK_b9509c5e082b4f48f089a8fab22"`);
        await queryRunner.query(`ALTER TABLE "user_stables" DROP CONSTRAINT "FK_0f378ff8f06b58de927d1f13e8a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_user_number"`);
        await queryRunner.query(`ALTER TABLE "contact_persons" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_83814de7a8048e0b591d24d017c"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "user_number"`);
        await queryRunner.query(`DROP TABLE "user_stables"`);
    }

}
