/**
 * STARTUP:
 *  - [ ] check env vars/config for: Joplin api key, mostRecentDate, base urls
 *  - [ ] if found in env var, update/create config accordingly
 *      - [ ] log and exit if api key not found
 *  - [x] validate that both Joplin api and anki api are running
 *      - [x] log and exit if not
 *  - [x] check for Joplin model & deck in anki, if not exist create
 *
 * EXPORT FROM JOPLIN:
 *  - [ ] retrieve last run datetime from config file
 *  - [x] get list of updated/new note ids from Joplin
 *  - [ ] iterate list, for each:
 *      - [x] get note
 *      - [x] parse out quiz data
 *      - [x] invoke ankiImport with it
 *      - [ ] if successful, update mostRecentDate based on note update date & increment success metric
 *      - [ ] if not successful, append id and error to errors array, increment failure metric
 *
 * IMPORT INTO ANKI:
 *  - [x] find note in anki by id field from joplin
 *      - [x] if not found: create new note
 *      - [x] if found: update by id
 *
 * FINISH:
 *  - [ ] update config file with mostRecentDate
 *  - [ ] log total success, and total failures with failure details
 *
 * EXTRA:
 *  - [ ] better logs, turn on off with debug flag
 *  - [ ] instantiate anki/joplin modules with needed env vars so they don't need passing int
 *  - [ ] tests
 */

const joplin = require("./joplin-exporter");
const anki = require("./anki-importer");

const dotenv = require("dotenv");
const { parsed: env } = dotenv.config();

const log = (msg) => {
  if (!!env.DEBUG) {
    console.log(msg);
  }
};

const run = async () => {
  try {
    await joplin.exporter(
      env.JOPLIN_URL,
      env.JOPLIN_TOKEN,
      env.EXPORT_FROM_DATE,
      anki.importer,
      anki.storeMedia
    );
  } catch (error) {
    console.error(`Problem with job: ${error}`);
    process.exit();
  }
};

run();
