import { htmlToJSON } from '@dayjot/editor/html';
import { dayjs } from '@supastack/utils-dates';
import fs from 'fs/promises';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { initDbSdk } from '../../src/sdk.ts';

const db = initDbSdk({
  uri: process.env['JOT_SQL_URL']!,
});

function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const demoUserEmail = 'demo-user@dayjot.com';

async function seed() {
  /**
   * Add user
   */
  const user = await db.queries.users.create({ email: demoUserEmail, emailVerified: new Date() });
  await db.client
    .insertInto('userKeys')
    .values({ id: `email:${demoUserEmail}`, userId: user.id })
    .execute();

  /**
   * Add entries
   */
  let date = dayjs();
  const wikiEntries = await fs.readdir(path.join(__dirname, 'wikipedia-entries'));
  console.log(`Adding ${wikiEntries.length} entries...`);

  for (const wikiEntry of wikiEntries) {
    const html = await fs.readFile(path.join(__dirname, 'wikipedia-entries', wikiEntry), 'utf8');
    const json = htmlToJSON(html);

    await db.queries.entries.bulkUpsert([
      {
        content: JSON.stringify(json),
        userId: user.id,
        day: date,
      },
    ]);

    date = date.subtract(randomIntFromInterval(1, 8), 'day');
  }
}

try {
  await seed();

  console.log(`Seeding completed. Login with ${demoUserEmail}.`);

  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}
