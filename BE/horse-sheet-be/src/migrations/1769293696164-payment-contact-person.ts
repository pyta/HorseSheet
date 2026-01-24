import { MigrationInterface, QueryRunner } from "typeorm";

export class PaymentContactPerson1769293696164 implements MigrationInterface {
    name = 'PaymentContactPerson1769293696164'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_7d001cdabfbb17c4bd8fa137092"`);
        await queryRunner.query(`ALTER TABLE "payments" RENAME COLUMN "participantId" TO "contactPersonId"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_b55dc2f2eed84203c1ade808471" FOREIGN KEY ("contactPersonId") REFERENCES "contact_persons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_b55dc2f2eed84203c1ade808471"`);
        await queryRunner.query(`ALTER TABLE "payments" RENAME COLUMN "contactPersonId" TO "participantId"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_7d001cdabfbb17c4bd8fa137092" FOREIGN KEY ("participantId") REFERENCES "participants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
