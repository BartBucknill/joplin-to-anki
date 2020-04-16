//run script
//pull note from anki and do comparison with expected sample
//delete sample cards from anki
const { run } = require("./joplin-to-anki");
const joplin = require("./joplin-client");
const anki = require("./anki-client");
const testNote = require("./joplin-test-data/sample-note");
const dotenv = require("dotenv");

const { parsed: env } = dotenv.config();
const jClient = joplin.newClient(env.JOPLIN_URL, env.JOPLIN_TOKEN, true);
const aClient = anki.newClient(env.ANKI_URL, true);

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
    const notes = await aClient.findNote(`tag:${testNote.title}`);
    console.log("found notes: ", notes);
    //TODO: check the above returns expected results, implement delete
  });
  it("should create Anki notes from Joplin note", async function () {
    await run();
  });
});
