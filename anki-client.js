const rp = require("request-promise-native");
const { newLogger } = require("./log");

const healthyPingResponse = "AnkiConnect v.6";
//TODO: these should not be at the client level
const modelName = "Joplin to Anki";
const deckName = "Joplin to Anki";

const newClient = (url, debug) => {
  return {
    url,
    log: newLogger(debug),

    formatTag(string) {
      return string.replace(/ /g, "_");
    },

    optionsGen(body) {
      return {
        uri: this.url,
        method: "POST",
        body: body,
        json: true,
      };
    },

    async doRequest(options) {
      const res = await rp(options);
      if (res.error != null) {
        throw new Error(`Received error from Anki Connect API: ${res.error}`);
      }
      return res.result;
    },

    getModels() {
      const options = this.optionsGen({
        action: "modelNamesAndIds",
        version: 6,
      });
      return this.doRequest(options);
    },

    createModel() {
      const options = this.optionsGen({
        action: "createModel",
        version: 6,
        params: {
          modelName,
          inOrderFields: ["Question", "Answer", "Joplin to Anki ID"],
          cardTemplates: [
            {
              Front: "{{Question}}",
              Back: "{{Answer}}",
            },
          ],
        },
      });
      return this.doRequest(options);
    },

    getDecks() {
      const options = this.optionsGen({
        action: "deckNamesAndIds",
        version: 6,
      });
      return this.doRequest(options);
    },

    createDeck() {
      const options = this.optionsGen({
        action: "createDeck",
        version: 6,
        params: {
          deck: deckName,
        },
      });
      return this.doRequest(options);
    },

    async setup() {
      const templates = await this.getModels();
      if (!templates[modelName]) {
        await this.createModel();
      }
      const decks = await this.getDecks();
      if (!decks[deckName]) {
        await this.createDeck();
      }
    },

    findNote(quizID) {
      const options = this.optionsGen({
        action: "findNotes",
        version: 6,
        params: {
          query: `deck:'${deckName}' ${quizID}`,
        },
      });
      return this.doRequest(options);
    },

    deleteNotes(ids) {
      const options = this.optionsGen({
        action: "deleteNotes",
        version: 6,
        params: {
          notes: ids,
        },
      });
      return this.doRequest(options);
    },

    createNote(question, answer, jtaID, title, notebook, tags) {
      const options = this.optionsGen({
        action: "addNote",
        version: 6,
        params: {
          note: {
            deckName,
            modelName,
            fields: {
              Question: question,
              Answer: answer,
              "Joplin to Anki ID": jtaID,
            },
            tags: [
              "joplin_to_anki",
              this.formatTag(title),
              this.formatTag(notebook),
              ...tags,
            ],
          },
        },
      });
      return this.doRequest(options);
    },

    updateNoteTags(id, title, notebook, joplinTags) {
      const tags = joplinTags.map((tag) => this.formatTag(tag));
      tags.push(this.formatTag(title));
      tags.push(this.formatTag(notebook));
      const options = this.optionsGen({
        action: "addTags",
        version: 6,
        params: {
          notes: [id],
          tags: tags.join(" "),
        },
      });
      return this.doRequest(options);
    },

    updateNote(id, question, answer) {
      const options = this.optionsGen({
        action: "updateNoteFields",
        version: 6,
        params: {
          note: {
            id,
            fields: {
              Question: question,
              Answer: answer,
            },
          },
        },
      });
      return this.doRequest(options);
    },

    storeMedia(fileName, data) {
      const options = this.optionsGen({
        action: "storeMediaFile",
        version: 6,
        params: {
          filename: fileName,
          data,
        },
      });
      return this.doRequest(options);
    },

    async ping() {
      return rp(this.url);
    },

    async health() {
      const result = await this.ping();
      if (result != healthyPingResponse) {
        throw new error(
          `Did not receive expected response from Anki api at ${env.ANKI_URL}\nResponse: ${result}\nExiting.`
        );
      }
      this.log("Anki Connect API Healthy");
    },
  };
};

module.exports = {
  newClient,
};
