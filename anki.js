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
            inOrderFields: ['Question', 'Answer', 'Quiz ID'],
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

const ankiSetup = async (url) => {
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

const createNote = (url, question, answer, quizID) => {
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
                    'Quiz ID': quizID,
                },
                'tags': [
                    'joplin_to_anki'
                ],
            }
        }
    })
    return doRequest(options)
}

const updateNote = (url, id, question, answer, quizID) => {
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

const ankiImport = async (url, question, answer, quizID) => {
    const noteIDs = await findNote(url, quizID)
    if (noteIDs.length > 1) {
        throw new Error('Oops, expected at most one note but found multiple: ', notes)
    }
    if (noteIDs.length === 1) {
        return updateNote(url, noteIDs[0], question, answer, quizID)
    }
    return createNote(url, question, answer, quizID)

}

module.exports = {
    ankiSetup,
    ankiImport,
}
