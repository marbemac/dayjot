import { initDbSdk } from '../../src/sdk.ts';

const db = initDbSdk({
  uri: process.env['JOT_SQL_URL']!,
});

async function seed() {}

try {
  await seed();

  console.log('Seeding completed.');

  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}
