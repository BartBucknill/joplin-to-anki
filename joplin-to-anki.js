const {
  exporter,
  typeItem,
  typeResource,
  typeError,
} = require("./joplin-exporter");
const { importer } = require("./anki-importer");
const joplin = require("./joplin-client");
const anki = require("./anki-client");
const dotenv = require("dotenv");
const { newLogger } = require("./log");
const log = newLogger(true);

const { parsed: env } = dotenv.config();
const jClient = joplin.newClient(env.JOPLIN_URL, env.JOPLIN_TOKEN, false);
const aClient = anki.newClient(env.ANKI_URL, true);

const run = async () => {
  await jClient.health();
  await aClient.health();

  try {
    await aClient.setup(env.ANKI_URL);
  } catch (error) {
    console.error(
      `Problem with Anki prerequisites (Joplin deck and model): ${error}`
    );
    process.exit();
  }

  const gen = exporter(jClient, env.EXPORT_FROM_DATE);
  for await (const value of gen) {
    switch (value.type) {
      case typeItem:
        try {
          console.log("typeItem: ", value);
          await importer(
            aClient,
            value.data.question,
            value.data.answer,
            value.data.jtaID,
            value.data.title,
            value.data.notebook,
            value.data.tags
          );
        } catch (error) {
          log(`Problem importing note to Anki: ${error}`);
        }
        break;
      case typeResource:
        console.log("typeResource: ", Object.keys(value.data));
        try {
          await aClient.storeMedia(value.data.fileName, value.data.data);
        } catch (error) {
          log(`Problem importing media to Anki: ${error}`);
        }

      default:
        break;
    }
  }

  console.log("DONE");
};

module.exports = {
  run,
};
