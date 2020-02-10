const path = require('path');
const rp = require('request-promise-native')
const cheerio = require('cheerio')
const fs = require('fs')

const extractQuiz = (body, title, notebook, tags) => {
    const $ = cheerio.load(body)
    let output = []
    $('.jta').each((i, el) => {
        const jtaID = $(el).attr('data-id')
        const question = $('.question', el).text()
        const answer = $('.answer', el).text()
        output.push({ question, answer, jtaID, title, notebook, tags })
    })
    return output
}

const escapeRegExp = string => {
    const reRegExpChar = /[\\^$.*+?()[\]{}|]/g
    return string.replace(reRegExpChar, '\\$&')
}

const addResources = (jtaItems, resources) => {
    const preppedResources = resources.map(resource => {
        const fileName = `${resource.title ? path.parse(resource.title).name : resource.id}.${resource.file_extension}`
        return {
            fileName,
            expectedLinkRgx: new RegExp(escapeRegExp(`![${resource.title}](:\/${resource.id})`), 'g'),
            replacementLink: `<div><img src="${fileName}"><br></div>`,
            id: resource.id,
        }
    })
    jtaItems.forEach(item => {
        preppedResources.forEach(resource => {
            if (resource.expectedLinkRgx.test(item.answer)) {
                const updatedAnswer = item.answer.replace(resource.expectedLinkRgx, resource.replacementLink)
                item.answer = updatedAnswer
                if (!item.resources) {
                    item.resources = []
                }
                item.resources.push({ id: resource.id, fileName: resource.fileName })
            }
        }
        )
    })
    return jtaItems
}

const ping = (url, token) => {
    return rp(`${url}/ping`)
}

const paramsGen = (token, fields) => {
    if (!token) throw new Error('No token for Joplin Api provided')
    let params = `?token=${token}`
    if (fields) params += `&fields=${fields}`
    return params
}

const urlGen = (baseURL, resource, id, subResource) => {
    let url = `${baseURL}/${resource}`
    if (id) url += `/${id}`
    if (subResource) url += `/${subResource}`
    return url
}

const get = (url, token, fields, parseJSON = true, encoding = undefined) => {
    const params = paramsGen(token, fields)
    const options = { uri: url + params, json: parseJSON }
    if (encoding) {
        options.encoding = encoding
    }
    return rp(options)
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

const exporter = async (url, token, datetime, iteratee, resourceIteratee) => {
    try {
        const date = new Date(datetime);
        const notes = await get(urlGen(url, 'notes'), token, 'id,updated_time')
        asyncForEach(notes, async note => {
            const noteDate = new Date(note.updated_time)
            if (noteDate.getTime() > date.getTime()) {
                const fullNote = await get(urlGen(url, 'notes', note.id), token, 'title,body,parent_id')
                const notebook = await get(urlGen(url, 'folders', fullNote.parent_id), token, 'title')
                const tags = await get(urlGen(url, 'notes', note.id, 'tags'), token, 'title')
                const tagTitles = tags.map(tag => tag.title)
                const jtaItems = extractQuiz(fullNote.body, fullNote.title, notebook.title, tagTitles)
                const resources = await get(urlGen(url, 'notes', note.id, 'resources'), token)
                const jtaItemsWithResourceDetails = addResources(jtaItems, resources)
                asyncForEach(jtaItemsWithResourceDetails, async item => {
                    // console.log({item})
                    await iteratee(process.env.ANKI_URL, item.question, item.answer, item.jtaID, item.title, item.notebook, item.tags)
                    .catch(err => console.log(`Oops! Something went wrong calling iteratee:\n${err}\nItem: ${JSON.stringify(item)}`))
                    if (item.resources && item.resources.length > 0) {
                        asyncForEach(item.resources, async resource => {
                            const file = await get(urlGen(url, 'resources', resource.id, 'file'), token, undefined, false, 'binary')
                            await resourceIteratee(process.env.ANKI_URL, resource.fileName, Buffer.from(file, 'binary').toString('base64'))
                            .catch(err => console.log(`Oops! Something went wrong calling resourceIteratee:\n ${err}\nItem: ${JSON.stringify(item)}`))
                        })
                    }
                })
            }
        })
    } catch (error) {
        console.error('Oops, something went wrong: ', error)
    }

}

module.exports = {
    ping,
    exporter,
    extractQuiz,
}
