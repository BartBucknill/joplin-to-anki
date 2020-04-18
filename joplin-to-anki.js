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
const {
  newLogger,
  levelApplication,
  levelVerbose,
  levelDebug,
} = require("./log");

const run = async (
  logLevel,
  joplinURL,
  joplinToken,
  exportFromDate,
  ankiURL
) => {
  const log = newLogger(logLevel);
  const jClient = joplin.newClient(joplinURL, joplinToken, log);
  const aClient = anki.newClient(ankiURL, log);
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
  const summary = {
    items: 0,
    itemsSuccess: 0,
    resources: 0,
    resourcesSuccess: 0,
    errorCount: 0,
  };
  for await (const value of gen) {
    switch (value.type) {
      case typeItem:
        summary.items++;
        log(
          levelVerbose,
          `Syncing question \"${value.data.question}\" from note \"${value.data.title}\"`
        );
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
          summary.itemsSuccess++;
        } catch (error) {
          log(levelApplication, `Problem importing note to Anki: ${error}`);
        }
        break;
      case typeResource:
        summary.resources++;
        log(levelVerbose, `Syncing resource \"${value.data.fileName}\"`);
        try {
          await aClient.storeMedia(value.data.fileName, value.data.data);
          summary.resourcesSuccess++;
        } catch (error) {
          log(levelApplication, `Problem importing media to Anki: ${error}`);
        }
        break;
      case typeError:
        summary.errorCount++;
        log(
          levelApplication,
          `Problem occurred exporting a note from Joplin: ${value.data}`
        );
        break;
      default:
        log(
          levelDebug,
          `Hit default case in exporter which should not happen! Item: ${value}`
        );
        break;
    }
  }
  log(
    levelApplication,
    `
Found ${summary.items} JTA items in Joplin notes updated since last run.
Imported ${summary.itemsSuccess} to Anki; ${
      summary.itemsSuccess - summary.items
    } failures.
Found ${summary.resources} resources attached to JTA items.
Imported ${summary.resourcesSuccess} to Anki; ${
      summary.resourcesSuccess - summary.resources
    } failures.
  `
  );
  log(levelApplication, "DONE");
};

module.exports = {
  run,
};
