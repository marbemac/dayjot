import { htmlToJSON } from '@libs/editor/html';
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

const demoWikiEmail = 'demo-wiki@dayjot.com';
const demoJakeEmail = 'demo-jake@dayjot.com';

async function seed() {
  await seedWikipedia();
  await seedJake();
}

const seedWikipedia = async () => {
  /**
   * Add user
   */
  const user = await db.queries.users.create({ email: demoWikiEmail, emailVerified: new Date() });
  await db.client
    .insertInto('userKeys')
    .values({ id: `email:${demoWikiEmail}`, userId: user.id })
    .execute();

  /**
   * Add entries
   */
  let date = dayjs();
  const wikiEntries = await fs.readdir(path.join(__dirname, 'wikipedia-entries'));
  console.log(`Adding ${wikiEntries.length} wikipedia entries...`);

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
};

const seedJake = async () => {
  /**
   * Add user
   */
  const user = await db.queries.users.create({ email: demoJakeEmail, emailVerified: new Date() });
  await db.client
    .insertInto('userKeys')
    .values({ id: `email:${demoJakeEmail}`, userId: user.id })
    .execute();

  /**
   * Add entries
   */
  const jakeEntries = JSON.parse(await fs.readFile(path.join(__dirname, 'chatgpt-jake.json'), 'utf8'));
  console.log(`Adding ${Object.keys(jakeEntries).length} entries...`);

  for (const day in jakeEntries) {
    const html = jakeEntries[day];
    const json = htmlToJSON(html);

    await db.queries.entries.bulkUpsert([
      {
        content: JSON.stringify(json),
        userId: user.id,
        day,
      },
    ]);
  }
};

try {
  await seed();

  console.log(`Seeding completed. Login with ${demoJakeEmail} or ${demoWikiEmail}.`);

  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}
