const rp = require('request-promise-native');

const modelName = 'Joplin to Anki'
const deckName = 'Joplin to Anki'

const optionsGen = (url, body) => {
    return {
        uri: url,
        method: 'POST',
        body: body,
        json: true,
    }
}

const doRequest = async (options) => {
    const res = await rp(options)
    if (res.error != null) {
        throw new Error(`Recieved error from anki api: ${res.error}`)
    }
    return res.result;
}

const getModels = (url) => {
    const options = optionsGen(url, {
        action: 'modelNamesAndIds',
        version: 6,
    })
    return doRequest(options)
}

const createModel = (url) => {
    const options = optionsGen(url, {
        'action': 'createModel',
        'version': 6,
        'params': {
            modelName,
            inOrderFields: ['Question', 'Answer', 'Joplin to Anki ID'],
            cardTemplates: [
                {
                    Front: '{{Question}}',
                    Back: '{{Answer}}',
                }
            ]
        }
    })
    return doRequest(options)
}

const getDecks = (url) => {
    const options = optionsGen(url, {
        'action': 'deckNamesAndIds',
        'version': 6
    })
    return doRequest(options)
}

const createDeck = (url) => {
    const options = optionsGen(url, {
        'action': 'createDeck',
        'version': 6,
        'params': {
            'deck': deckName,
        }
    })
    return doRequest(options)
}

const setup = async (url) => {
    const templates = await getModels(url)
    if (!templates[modelName]) {
        await createModel(url)
    }
    const decks = await getDecks(url)
    if (!decks[deckName]) {
        await createDeck(url)
    }
}

const findNote = (url, quizID) => {
    const options = optionsGen(url, {
        'action': 'findNotes',
        'version': 6,
        'params': {
            'query': `deck:'${deckName}' ${quizID}`
        }
    })
    return doRequest(options)
}

const formatTag = string => string.replace(/ /g, '_')

const createNote = (url, question, answer, jtaID, title, notebook, tags) => {
    const options = optionsGen(url, {
        'action': 'addNote',
        'version': 6,
        'params': {
            'note':
            {
                deckName,
                modelName,
                'fields': {
                    'Question': question,
                    'Answer': answer,
                    'Joplin to Anki ID': jtaID,
                },
                'tags': [
                    'joplin_to_anki',
                    formatTag(title),
                    formatTag(notebook),
                    ...tags,
                ],
            }
        }
    })
    return doRequest(options)
}

const updateNoteTags = (url, id, title, notebook, joplinTags) => {
    const tags = joplinTags.map(tag => formatTag(tag))
    tags.push(formatTag(title))
    tags.push(formatTag(notebook))
    const options = optionsGen(url, {
        "action": "addTags",
        "version": 6,
        "params": {
            "notes": [id],
            "tags": tags.join(' ')
        }
    })
    return doRequest(options)
}

const updateNote = (url, id, question, answer, jtaID, notebook, tags) => {
    const options = optionsGen(url, {
        'action': 'updateNoteFields',
        'version': 6,
        'params': {
            'note':
            {
                id,
                'fields': {
                    'Question': question,
                    'Answer': answer,
                },
            }
        }
    })
    return doRequest(options)

}

const importer = async (url, question, answer, jtaID, title, notebook, tags) => {
    const noteIDs = await findNote(url, jtaID)
    if (noteIDs.length > 1) {
        throw new Error(`Oops, expected at most one note with Joplin to Anki ID ${jtaID} but found multiple: \n${notes}`)
    }
    if (noteIDs.length === 1) {
        await updateNote(url, noteIDs[0], question, answer, jtaID, notebook, tags)
        return updateNoteTags(url, noteIDs[0], title, notebook, tags)
    }
    return createNote(url, question, answer, jtaID, title, notebook, tags)
}

const ping = async (url) => {
    return rp(url)
}

module.exports = {
    ping,
    setup,
    importer,
}
