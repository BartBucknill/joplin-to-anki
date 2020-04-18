const { run } = require("./joplin-to-anki");
const dotenv = require("dotenv");

const { parsed: env } = dotenv.config();

async function main() {
  await run(
    env.JOPLIN_URL,
    env.JOPLIN_TOKEN,
    env.EXPORT_FROM_DATE,
    env.ANKI_URL
  );
}

main();
