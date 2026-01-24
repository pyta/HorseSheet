import { MigrationInterface, QueryRunner } from "typeorm";

export class Balances1769158351787 implements MigrationInterface {
    name = 'Balances1769158351787'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "service_price_list_histories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, "stableId" uuid NOT NULL, "serviceId" uuid NOT NULL, "price" numeric(10,2) NOT NULL, "currency" character varying(3) NOT NULL DEFAULT 'PLN', "isActive" boolean NOT NULL DEFAULT true, "dateFrom" date NOT NULL, "dateTo" date, CONSTRAINT "PK_c803c5b5449252d41d66c39895c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "individual_service_price_list_histories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, "stableId" uuid NOT NULL, "serviceId" uuid, "price" numeric(10,2) NOT NULL, "currency" character varying(3) NOT NULL DEFAULT 'PLN', "participantId" uuid NOT NULL, "dateFrom" date NOT NULL, "dateTo" date, CONSTRAINT "PK_5a8c08b00a80d215ccb114bd591" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "individual_activity_price_list_histories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, "stableId" uuid NOT NULL, "activityId" uuid, "price" numeric(10,2) NOT NULL, "currency" character varying(3) NOT NULL DEFAULT 'PLN', "instructorId" uuid NOT NULL, "participantId" uuid NOT NULL, "dateFrom" date NOT NULL, "dateTo" date, CONSTRAINT "PK_d57d28d6f787f356d282361e9c4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "balances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, "contactPersonId" uuid NOT NULL, "balance" numeric(10,2) NOT NULL, CONSTRAINT "PK_74904758e813e401abc3d4261c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "activity_price_list_histories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, "stableId" uuid NOT NULL, "activityId" uuid NOT NULL, "price" numeric(10,2) NOT NULL, "currency" character varying(3) NOT NULL DEFAULT 'PLN', "isActive" boolean NOT NULL DEFAULT true, "dateFrom" date NOT NULL, "dateTo" date, CONSTRAINT "PK_3648394bc33036f7baeaf6dfdde" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "balance"`);
        await queryRunner.query(`ALTER TABLE "service_price_list_histories" ADD CONSTRAINT "FK_4abcab21f15ef78b4e131b86d4c" FOREIGN KEY ("stableId") REFERENCES "stables"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_price_list_histories" ADD CONSTRAINT "FK_6595417a785cba58c20365a45fc" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "individual_service_price_list_histories" ADD CONSTRAINT "FK_a17d36ad91e5df2139054ff4429" FOREIGN KEY ("stableId") REFERENCES "stables"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "individual_service_price_list_histories" ADD CONSTRAINT "FK_91d2d8e889e1fe194f5ecea434e" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "individual_service_price_list_histories" ADD CONSTRAINT "FK_ce765c192cfb37b577794dd682d" FOREIGN KEY ("participantId") REFERENCES "participants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "individual_activity_price_list_histories" ADD CONSTRAINT "FK_69a2386535aa570b9265788777f" FOREIGN KEY ("stableId") REFERENCES "stables"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "individual_activity_price_list_histories" ADD CONSTRAINT "FK_d3c07dfe25c3444ef364ce6bc51" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "individual_activity_price_list_histories" ADD CONSTRAINT "FK_acde4356d31229ae5e569880402" FOREIGN KEY ("instructorId") REFERENCES "instructors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "individual_activity_price_list_histories" ADD CONSTRAINT "FK_0c168a78a3d6e76c0150de3c742" FOREIGN KEY ("participantId") REFERENCES "participants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "balances" ADD CONSTRAINT "FK_4fb21c87e323e9bece3b1e4852c" FOREIGN KEY ("contactPersonId") REFERENCES "contact_persons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activity_price_list_histories" ADD CONSTRAINT "FK_208445f001b25219c777af0b1e7" FOREIGN KEY ("stableId") REFERENCES "stables"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activity_price_list_histories" ADD CONSTRAINT "FK_28ac1aa9c45d0412e10b2e48b0e" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activity_price_list_histories" DROP CONSTRAINT "FK_28ac1aa9c45d0412e10b2e48b0e"`);
        await queryRunner.query(`ALTER TABLE "activity_price_list_histories" DROP CONSTRAINT "FK_208445f001b25219c777af0b1e7"`);
        await queryRunner.query(`ALTER TABLE "balances" DROP CONSTRAINT "FK_4fb21c87e323e9bece3b1e4852c"`);
        await queryRunner.query(`ALTER TABLE "individual_activity_price_list_histories" DROP CONSTRAINT "FK_0c168a78a3d6e76c0150de3c742"`);
        await queryRunner.query(`ALTER TABLE "individual_activity_price_list_histories" DROP CONSTRAINT "FK_acde4356d31229ae5e569880402"`);
        await queryRunner.query(`ALTER TABLE "individual_activity_price_list_histories" DROP CONSTRAINT "FK_d3c07dfe25c3444ef364ce6bc51"`);
        await queryRunner.query(`ALTER TABLE "individual_activity_price_list_histories" DROP CONSTRAINT "FK_69a2386535aa570b9265788777f"`);
        await queryRunner.query(`ALTER TABLE "individual_service_price_list_histories" DROP CONSTRAINT "FK_ce765c192cfb37b577794dd682d"`);
        await queryRunner.query(`ALTER TABLE "individual_service_price_list_histories" DROP CONSTRAINT "FK_91d2d8e889e1fe194f5ecea434e"`);
        await queryRunner.query(`ALTER TABLE "individual_service_price_list_histories" DROP CONSTRAINT "FK_a17d36ad91e5df2139054ff4429"`);
        await queryRunner.query(`ALTER TABLE "service_price_list_histories" DROP CONSTRAINT "FK_6595417a785cba58c20365a45fc"`);
        await queryRunner.query(`ALTER TABLE "service_price_list_histories" DROP CONSTRAINT "FK_4abcab21f15ef78b4e131b86d4c"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "balance" numeric(10,2) NOT NULL`);
        await queryRunner.query(`DROP TABLE "activity_price_list_histories"`);
        await queryRunner.query(`DROP TABLE "balances"`);
        await queryRunner.query(`DROP TABLE "individual_activity_price_list_histories"`);
        await queryRunner.query(`DROP TABLE "individual_service_price_list_histories"`);
        await queryRunner.query(`DROP TABLE "service_price_list_histories"`);
    }

}
