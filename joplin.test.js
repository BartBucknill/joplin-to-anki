const assert = require("assert");
const { extractQuiz } = require("./joplin-exporter");
const note = require("./joplin-test-data/sample-note");
const notebookName = "Note Book Name";
const noteTags = ["tag1", "tag with spaces"];

describe("joplin exporter", function () {
  describe("extractQuiz", function () {
    it("should extract all 3 QA", function () {
      const expected = [
        {
          question: "**Question:**\nQuestion one?\n",
          answer:
            "Answer:\nAnswer one\nImage\n![photo.jpg](:/b3a6a0a907a740c6ad9de7d440713c36)\n",
          jtaID: "2020-01-11T17-37-49-563",
          title: "Test Note Joplin to Anki",
          notebook: "Note Book Name",
          tags: ["tag1", "tag with spaces"],
        },
        {
          question: "**Question:**\nQuestion two?\n",
          answer: "Answer:\nAnswer two\nCode block\n```sh\necho $ANSWER\n```\n",
          jtaID: "2020-01-11T17-40-16-643",
          title: "Test Note Joplin to Anki",
          notebook: "Note Book Name",
          tags: ["tag1", "tag with spaces"],
        },
        {
          question: "**Question:**\nQuestion three?\n",
          answer: "Answer:\nAnswer three\n",
          jtaID: "2020-01-11T17-41-12-703",
          title: "Test Note Joplin to Anki",
          notebook: "Note Book Name",
          tags: ["tag1", "tag with spaces"],
        },
      ];
      const actual = extractQuiz(note.body, note.title, notebookName, noteTags);
      assert.deepStrictEqual(actual, expected);
    });
  });
});
