import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1768741493687 implements MigrationInterface {
    name = 'InitSchema1768741493687'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "stables" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, "name" character varying(255) NOT NULL, "address" text, "contactInfo" text, "timezone" character varying(50), "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_0c955963e4f81a156289b45a7b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, "name" character varying(255) NOT NULL, "description" text, "stableId" uuid NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "contact_persons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, "name" character varying(255) NOT NULL, "email" character varying(255), "phone" character varying(50), "stableId" uuid NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_7ac4bdd4703f21ec369f9418d98" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "participants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, "name" character varying(255) NOT NULL, "email" character varying(255), "phone" character varying(50), "stableId" uuid NOT NULL, "defaultContactPersonId" uuid NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_1cda06c31eec1c95b3365a0283f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "service_schedule_entry_details" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, "serviceScheduleEntryId" uuid NOT NULL, "participantId" uuid NOT NULL, CONSTRAINT "PK_0f9aae85d59c0d03c94fb1ac78c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "service_schedule_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, "stableId" uuid NOT NULL, "date" date NOT NULL, "duration" character varying(50) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "serviceId" uuid NOT NULL, CONSTRAINT "PK_a2e991500c580e914a03347c048" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, "stableId" uuid NOT NULL, "participantId" uuid NOT NULL, "amount" numeric(10,2) NOT NULL, "paymentDate" date NOT NULL, "balance" numeric(10,2) NOT NULL, CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "service_price_lists" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, "stableId" uuid NOT NULL, "serviceId" uuid NOT NULL, "price" numeric(10,2) NOT NULL, "currency" character varying(3) NOT NULL DEFAULT 'PLN', "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_5d55521eea13f94ef7e3a693c1a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "instructors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, "name" character varying(255) NOT NULL, "stableId" uuid NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_95e3da69ca76176ea4ab8435098" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "individual_service_price_lists" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, "stableId" uuid NOT NULL, "serviceId" uuid, "price" numeric(10,2) NOT NULL, "currency" character varying(3) NOT NULL DEFAULT 'PLN', "participantId" uuid NOT NULL, CONSTRAINT "PK_38adc844d04cc75ab0c69c0236a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "activities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, "name" character varying(255) NOT NULL, "description" text, "stableId" uuid NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_7f4004429f731ffb9c88eb486a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "individual_activity_price_lists" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, "stableId" uuid NOT NULL, "activityId" uuid, "price" numeric(10,2) NOT NULL, "currency" character varying(3) NOT NULL DEFAULT 'PLN', "instructorId" uuid NOT NULL, "participantId" uuid NOT NULL, CONSTRAINT "PK_8db660c0be5aaf669b3a3dc640f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "activity_schedule_entry_details" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, "activityScheduleEntryId" uuid NOT NULL, "participantId" uuid NOT NULL, CONSTRAINT "PK_00ff554f4aafb730946d1009857" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "activity_schedule_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, "stableId" uuid NOT NULL, "date" date NOT NULL, "time" TIME NOT NULL, "duration" integer NOT NULL, "instructorId" uuid NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "activityId" uuid NOT NULL, CONSTRAINT "PK_bf40311d821a4ca2974fc515c26" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "activity_price_lists" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, "stableId" uuid NOT NULL, "activityId" uuid NOT NULL, "price" numeric(10,2) NOT NULL, "currency" character varying(3) NOT NULL DEFAULT 'PLN', "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_e021d969969b5ba2507fbb334b9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_6baedde5a20919ef34e773e0e94" FOREIGN KEY ("stableId") REFERENCES "stables"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contact_persons" ADD CONSTRAINT "FK_d93b97927d634a2326c78738310" FOREIGN KEY ("stableId") REFERENCES "stables"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "participants" ADD CONSTRAINT "FK_ba33e2266abfcdcb376af0a1015" FOREIGN KEY ("stableId") REFERENCES "stables"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "participants" ADD CONSTRAINT "FK_b20403de13d4c5c86f825b987b5" FOREIGN KEY ("defaultContactPersonId") REFERENCES "contact_persons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_schedule_entry_details" ADD CONSTRAINT "FK_be4f2ba81d508a9927e3d279a89" FOREIGN KEY ("serviceScheduleEntryId") REFERENCES "service_schedule_entries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_schedule_entry_details" ADD CONSTRAINT "FK_d9f491c2e49312076f47c4a98cc" FOREIGN KEY ("participantId") REFERENCES "participants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_schedule_entries" ADD CONSTRAINT "FK_878e60d71d4064238c539704d42" FOREIGN KEY ("stableId") REFERENCES "stables"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_schedule_entries" ADD CONSTRAINT "FK_777f228e9fbea42f45328ac8eb5" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_070d7af67bb05ecfe3aac377f04" FOREIGN KEY ("stableId") REFERENCES "stables"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_7d001cdabfbb17c4bd8fa137092" FOREIGN KEY ("participantId") REFERENCES "participants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_price_lists" ADD CONSTRAINT "FK_65af311b198fad69145340b722e" FOREIGN KEY ("stableId") REFERENCES "stables"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_price_lists" ADD CONSTRAINT "FK_4f6748f573e42f562f27f764d92" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "instructors" ADD CONSTRAINT "FK_cf5ecdd778883c00e72f18d5508" FOREIGN KEY ("stableId") REFERENCES "stables"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "individual_service_price_lists" ADD CONSTRAINT "FK_e931d029a95cd82b99ffb3f4957" FOREIGN KEY ("stableId") REFERENCES "stables"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "individual_service_price_lists" ADD CONSTRAINT "FK_be6a636178089bdeea6e948db21" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "individual_service_price_lists" ADD CONSTRAINT "FK_77062b07ffc61ec2c2271c3e56f" FOREIGN KEY ("participantId") REFERENCES "participants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activities" ADD CONSTRAINT "FK_fff37c1a1f50d9d1da418c94cfe" FOREIGN KEY ("stableId") REFERENCES "stables"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "individual_activity_price_lists" ADD CONSTRAINT "FK_bd850b5505501969f3b4cdfc47b" FOREIGN KEY ("stableId") REFERENCES "stables"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "individual_activity_price_lists" ADD CONSTRAINT "FK_f2dc43e5dd276d8833672e6863f" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "individual_activity_price_lists" ADD CONSTRAINT "FK_93ee04c1f873457bafce74e4971" FOREIGN KEY ("instructorId") REFERENCES "instructors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "individual_activity_price_lists" ADD CONSTRAINT "FK_577cbbe5ebcd9a740dbc4580594" FOREIGN KEY ("participantId") REFERENCES "participants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activity_schedule_entry_details" ADD CONSTRAINT "FK_0a25f7713a569fb02dd220e708c" FOREIGN KEY ("activityScheduleEntryId") REFERENCES "activity_schedule_entries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activity_schedule_entry_details" ADD CONSTRAINT "FK_bcfe3e1d0e3740914367b5e5242" FOREIGN KEY ("participantId") REFERENCES "participants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activity_schedule_entries" ADD CONSTRAINT "FK_de2297ee0668e86f2e723f41afd" FOREIGN KEY ("stableId") REFERENCES "stables"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activity_schedule_entries" ADD CONSTRAINT "FK_32f38a775f73228d5a037eeb72f" FOREIGN KEY ("instructorId") REFERENCES "instructors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activity_schedule_entries" ADD CONSTRAINT "FK_8899f4f4eb281fdd5f260f7081d" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activity_price_lists" ADD CONSTRAINT "FK_b01bd53f40b58aa1665cad2fe6d" FOREIGN KEY ("stableId") REFERENCES "stables"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activity_price_lists" ADD CONSTRAINT "FK_41b67d4b008d266b3a6d1a87b44" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activity_price_lists" DROP CONSTRAINT "FK_41b67d4b008d266b3a6d1a87b44"`);
        await queryRunner.query(`ALTER TABLE "activity_price_lists" DROP CONSTRAINT "FK_b01bd53f40b58aa1665cad2fe6d"`);
        await queryRunner.query(`ALTER TABLE "activity_schedule_entries" DROP CONSTRAINT "FK_8899f4f4eb281fdd5f260f7081d"`);
        await queryRunner.query(`ALTER TABLE "activity_schedule_entries" DROP CONSTRAINT "FK_32f38a775f73228d5a037eeb72f"`);
        await queryRunner.query(`ALTER TABLE "activity_schedule_entries" DROP CONSTRAINT "FK_de2297ee0668e86f2e723f41afd"`);
        await queryRunner.query(`ALTER TABLE "activity_schedule_entry_details" DROP CONSTRAINT "FK_bcfe3e1d0e3740914367b5e5242"`);
        await queryRunner.query(`ALTER TABLE "activity_schedule_entry_details" DROP CONSTRAINT "FK_0a25f7713a569fb02dd220e708c"`);
        await queryRunner.query(`ALTER TABLE "individual_activity_price_lists" DROP CONSTRAINT "FK_577cbbe5ebcd9a740dbc4580594"`);
        await queryRunner.query(`ALTER TABLE "individual_activity_price_lists" DROP CONSTRAINT "FK_93ee04c1f873457bafce74e4971"`);
        await queryRunner.query(`ALTER TABLE "individual_activity_price_lists" DROP CONSTRAINT "FK_f2dc43e5dd276d8833672e6863f"`);
        await queryRunner.query(`ALTER TABLE "individual_activity_price_lists" DROP CONSTRAINT "FK_bd850b5505501969f3b4cdfc47b"`);
        await queryRunner.query(`ALTER TABLE "activities" DROP CONSTRAINT "FK_fff37c1a1f50d9d1da418c94cfe"`);
        await queryRunner.query(`ALTER TABLE "individual_service_price_lists" DROP CONSTRAINT "FK_77062b07ffc61ec2c2271c3e56f"`);
        await queryRunner.query(`ALTER TABLE "individual_service_price_lists" DROP CONSTRAINT "FK_be6a636178089bdeea6e948db21"`);
        await queryRunner.query(`ALTER TABLE "individual_service_price_lists" DROP CONSTRAINT "FK_e931d029a95cd82b99ffb3f4957"`);
        await queryRunner.query(`ALTER TABLE "instructors" DROP CONSTRAINT "FK_cf5ecdd778883c00e72f18d5508"`);
        await queryRunner.query(`ALTER TABLE "service_price_lists" DROP CONSTRAINT "FK_4f6748f573e42f562f27f764d92"`);
        await queryRunner.query(`ALTER TABLE "service_price_lists" DROP CONSTRAINT "FK_65af311b198fad69145340b722e"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_7d001cdabfbb17c4bd8fa137092"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_070d7af67bb05ecfe3aac377f04"`);
        await queryRunner.query(`ALTER TABLE "service_schedule_entries" DROP CONSTRAINT "FK_777f228e9fbea42f45328ac8eb5"`);
        await queryRunner.query(`ALTER TABLE "service_schedule_entries" DROP CONSTRAINT "FK_878e60d71d4064238c539704d42"`);
        await queryRunner.query(`ALTER TABLE "service_schedule_entry_details" DROP CONSTRAINT "FK_d9f491c2e49312076f47c4a98cc"`);
        await queryRunner.query(`ALTER TABLE "service_schedule_entry_details" DROP CONSTRAINT "FK_be4f2ba81d508a9927e3d279a89"`);
        await queryRunner.query(`ALTER TABLE "participants" DROP CONSTRAINT "FK_b20403de13d4c5c86f825b987b5"`);
        await queryRunner.query(`ALTER TABLE "participants" DROP CONSTRAINT "FK_ba33e2266abfcdcb376af0a1015"`);
        await queryRunner.query(`ALTER TABLE "contact_persons" DROP CONSTRAINT "FK_d93b97927d634a2326c78738310"`);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_6baedde5a20919ef34e773e0e94"`);
        await queryRunner.query(`DROP TABLE "activity_price_lists"`);
        await queryRunner.query(`DROP TABLE "activity_schedule_entries"`);
        await queryRunner.query(`DROP TABLE "activity_schedule_entry_details"`);
        await queryRunner.query(`DROP TABLE "individual_activity_price_lists"`);
        await queryRunner.query(`DROP TABLE "activities"`);
        await queryRunner.query(`DROP TABLE "individual_service_price_lists"`);
        await queryRunner.query(`DROP TABLE "instructors"`);
        await queryRunner.query(`DROP TABLE "service_price_lists"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TABLE "service_schedule_entries"`);
        await queryRunner.query(`DROP TABLE "service_schedule_entry_details"`);
        await queryRunner.query(`DROP TABLE "participants"`);
        await queryRunner.query(`DROP TABLE "contact_persons"`);
        await queryRunner.query(`DROP TABLE "services"`);
        await queryRunner.query(`DROP TABLE "stables"`);
    }

}
