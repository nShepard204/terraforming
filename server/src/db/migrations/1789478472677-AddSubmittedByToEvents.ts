import { type MigrationInterface, type QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddSubmittedByToEvents1789478472677 implements MigrationInterface {
  name = 'AddSubmittedByToEvents1789478472677';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'events',
      new TableColumn({
        name: 'submitted_by',
        type: 'uuid',
        isNullable: true,
      })
    );

    // References the user table Neon Auth manages directly in this same
    // database, so user-submitted events stay tied to their submitter even
    // though that table isn't one of this app's own TypeORM entities. Set
    // null on delete rather than blocking user deletion.
    await queryRunner.createForeignKey(
      'events',
      new TableForeignKey({
        name: 'ref_submitted_by',
        columnNames: ['submitted_by'],
        referencedSchema: 'neon_auth',
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('events', 'ref_submitted_by');
    await queryRunner.dropColumn('events', 'submitted_by');
  }
}
