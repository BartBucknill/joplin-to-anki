const assert = require("assert");
const { exporter, extractQuiz } = require("./joplin");
const dotenv = require("dotenv");
const { parsed: env } = dotenv.config();
const note = require("./joplin-test-data/sample-note");
const notebookName = "Note Book Name";
const noteTags = ["tag1", "tag with spaces"];
// const test = async () => {
//     console.log(env)
//     const result = await exporter(env.JOPLIN_URL, env.JOPLIN_TOKEN, env.EXPORT_FROM_DATE, ()=>{}, ()=>{})
//         .catch(console.error)
//     console.log(result)
// }
// test()

describe("joplin exporter", function () {
  describe("extractQuiz", function () {
    it("should extract all 3 QA", function () {
      const expected = [
        {
          question: "**Question:**\nShortcut to insert template in Joplin?\n",
          answer: "Answer:\ncmd + opt + i\n",
          jtaID: "2020-01-11T17-37-49-563",
          title: "Note Title",
          notebook: "Note Book Name",
          tags: ["tag1", "tag with spaces"],
        },
        {
          question:
            "**Question:**\nShortcut to toggle editor layout in Joplin?\n",
          answer: "Answer:\ncmd + l (lowercase L)\n",
          jtaID: "2020-01-11T17-40-16-643",
          title: "Note Title",
          notebook: "Note Book Name",
          tags: ["tag1", "tag with spaces"],
        },
        {
          question:
            "**Question:**\nHow to enter multiline edit mode in VS Code?\n",
          answer: "Answer:\nopt + cmd + up/down\n",
          jtaID: "2020-01-11T17-41-12-703",
          title: "Note Title",
          notebook: "Note Book Name",
          tags: ["tag1", "tag with spaces"],
        },
      ];
      const actual = extractQuiz(note.body, note.title, notebookName, noteTags);
      assert.deepStrictEqual(actual, expected);
    });
  });
});
