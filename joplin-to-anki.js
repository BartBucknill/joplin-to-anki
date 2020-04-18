const markdown = require("markdown").markdown;
const {
  exporter,
  typeItem,
  typeResource,
  typeError,
} = require("./joplin-exporter");
const { importer } = require("./anki-importer");
const joplin = require("./joplin-client");
const anki = require("./anki-client");
const { newLogger } = require("./log");
const log = newLogger(true);

const run = async (joplinURL, joplinToken, exportFromDate, ankiURL) => {
  const jClient = joplin.newClient(joplinURL, joplinToken, true);
  const aClient = anki.newClient(ankiURL, true);
  await jClient.health();
  await aClient.health();

  try {
    await aClient.setup(ankiURL);
  } catch (error) {
    console.error(
      `Problem with Anki prerequisites (Joplin deck and model): ${error}`
    );
    process.exit();
  }

  const gen = exporter(jClient, exportFromDate);
  for await (const value of gen) {
    switch (value.type) {
      case typeItem:
        try {
          await importer(
            aClient,
            markdown.toHTML(value.data.question),
            markdown.toHTML(value.data.answer),
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
        try {
          await aClient.storeMedia(value.data.fileName, value.data.data);
        } catch (error) {
          log(`Problem importing media to Anki: ${error}`);
        }
        break;
      case typeError:
        log(`Problem occurred exporting a note from Joplin: ${value.data}`);
        break;
      default:
        log(
          `Hit default case in exporter which should not happen! Item: ${value}`
        );
        break;
    }
  }

  console.log("DONE");
};

module.exports = {
  run,
};
