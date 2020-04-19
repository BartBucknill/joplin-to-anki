const { run } = require("./joplin-to-anki");
const joplin = require("./joplin-client");
const anki = require("./anki-client");
const testNote = require("./joplin-test-data/sample-note");
const dotenv = require("dotenv");

const assert = require("assert");
const { parsed: env } = dotenv.config();
const { newLogger, levelDebug } = require("./log");
const log = newLogger(levelDebug);
const jClient = joplin.newClient(env.JOPLIN_URL, env.JOPLIN_TOKEN, log);
const aClient = anki.newClient(env.ANKI_URL, log);
const fromDate = new Date().toISOString();

describe("Joplin to Anki integration", function () {
  before("Healthcheck Joplin API", async function () {
    await jClient.health();
  });
  before("Healthcheck Anki Connect API", async function () {
    await aClient.health();
  });
  before("Create Joplin test note", async function () {
    const note = await jClient.request(
      jClient.urlGen("notes"),
      "POST",
      testNote
    );
    this.testNoteID = note.id;
  });
  after("Delete test note from Joplin", async function () {
    await jClient.request(jClient.urlGen("notes", this.testNoteID), "DELETE");
  });
  after("Delete test note from Anki", async function () {
    const notes = await aClient.findNote(
      `tag:${aClient.formatTag(testNote.title)}`
    );
    await aClient.deleteNotes(notes);
  });
  before("run joplin-to-anki (import from Joplin to Anki)", async function () {
    await run(
      levelDebug,
      env.JOPLIN_URL,
      env.JOPLIN_TOKEN,
      fromDate,
      env.ANKI_URL
    );
  });
  it("should create 3 Anki notes from Joplin note", async function () {
    const notes = await aClient.findNote(
      `tag:${aClient.formatTag(testNote.title)}`
    );
    assert.equal(notes.length, 3);
  });
});
