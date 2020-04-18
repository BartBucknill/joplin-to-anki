const path = require("path");
const cheerio = require("cheerio");

const extractQuiz = (body, title, notebook, tags) => {
  const $ = cheerio.load(body);
  let output = [];
  $(".jta").each((i, el) => {
    const jtaID = $(el).attr("data-id");
    const question = $(".question", el).text();
    const answer = $(".answer", el).text();
    output.push({ question, answer, jtaID, title, notebook, tags });
  });
  return output;
};

const escapeRegExp = (string) => {
  const reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
  return string.replace(reRegExpChar, "\\$&");
};

const addResources = (jtaItems, resources) => {
  const preppedResources = resources.map((resource) => {
    const fileName = `${resource.id}.${resource.file_extension}`;
    return {
      fileName,
      expectedLinkRgx: new RegExp(
        escapeRegExp(`![${resource.title}](:\/${resource.id})`),
        "g"
      ),
      replacementLink: `![${resource.title}](${fileName})`,
      id: resource.id,
    };
  });
  jtaItems.forEach((item) => {
    preppedResources.forEach((resource) => {
      if (resource.expectedLinkRgx.test(item.answer)) {
        const updatedAnswer = item.answer.replace(
          resource.expectedLinkRgx,
          resource.replacementLink
        );
        item.answer = updatedAnswer;
        if (!item.resources) {
          item.resources = [];
        }
        item.resources.push({ id: resource.id, fileName: resource.fileName });
      }
      if (resource.expectedLinkRgx.test(item.question)) {
        const updatedQuestion = item.question.replace(
          resource.expectedLinkRgx,
          resource.replacementLink
        );
        item.question = updatedQuestion;
        if (!item.resources) {
          item.resources = [];
        }
        item.resources.push({ id: resource.id, fileName: resource.fileName });
      }
    });
  });
  return jtaItems;
};

const typeItem = "item";
const typeResource = "resource";
const typeError = "error";

async function* exporter(client, datetime) {
  const date = new Date(datetime);
  const notes = await client.request(
    client.urlGen("notes"),
    "GET",
    undefined,
    "id,updated_time"
  );
  for (const note of notes) {
    try {
      const noteDate = new Date(note.updated_time);
      if (noteDate.getTime() < date.getTime()) {
        continue;
      }
      const fullNote = await client.request(
        client.urlGen("notes", note.id),
        "GET",
        undefined,
        "title,body,parent_id"
      );
      const notebook = await client.request(
        client.urlGen("folders", fullNote.parent_id),
        undefined,
        "title"
      );
      const tags = await client.request(
        client.urlGen("notes", note.id, "tags"),
        undefined,
        "title"
      );
      const tagTitles = tags.map((tag) => tag.title);
      const jtaItems = extractQuiz(
        fullNote.body,
        fullNote.title,
        notebook.title,
        tagTitles
      );
      const resources = await client.request(
        client.urlGen("notes", note.id, "resources"),
        "GET"
      );
      const jtaItemsWithResourceDetails = addResources(jtaItems, resources);

      for (const item of jtaItemsWithResourceDetails) {
        yield {
          type: typeItem,
          data: item,
        };
        if (!item.resources || item.resources.length <= 0) {
          continue;
        }
        for (const resource of item.resources) {
          const file = await client.request(
            client.urlGen("resources", resource.id, "file"),
            "GET",
            undefined,
            undefined,
            false,
            "binary"
          );
          yield {
            type: typeResource,
            data: {
              fileName: resource.fileName,
              data: Buffer.from(file, "binary").toString("base64"),
            },
          };
        }
      }
    } catch (error) {
      yield {
        type: typeError,
        data: error,
      };
    }
  }
}

module.exports = {
  exporter,
  typeItem,
  typeResource,
  typeError,
  extractQuiz,
};
