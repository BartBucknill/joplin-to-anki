const rp = require('request-promise-native');
const cheerio = require('cheerio')

const extractQuiz = (iteratee, body, title, notebook, tags) => {
    const $ = cheerio.load(body)
    $('.jta').each((i, el) => {
        const jtaID = $(el).attr('data-id')
        const question = $('.question', el).text()
        const answer = $('.answer', el).text()
        iteratee(process.env.ANKI_URL, question, answer, jtaID, title, notebook, tags)
    })
}

const ping = (url, token) => {
    return rp(`${url}/ping`)
}

const paramsGen = (token, fields) => {
    if (!token) throw new Error("No token for Joplin Api provided")
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

const get = (url, token, fields) => {
    const params = paramsGen(token, fields)
    return rp({ uri: url + params, json: true })
}

const exporter = async (url, token, datetime, iteratee) => {
    try {
        const date = new Date(datetime);
        const notes = await get(urlGen(url, 'notes'), token, 'id,updated_time')
        notes.forEach(async note => {
            const noteDate = new Date(note.updated_time)
            if (noteDate.getTime() > date.getTime()) {
                const fullNote = await get(urlGen(url, 'notes', note.id), token, 'title,body,parent_id')
                const notebook = await get(urlGen(url, 'folders', fullNote.parent_id), token, 'title')
                const tags = await get(urlGen(url, 'notes', note.id, 'tags'), token, 'title')
                const tagTitles = tags.map(tag => tag.title)
                console.log(tagTitles)
                extractQuiz(iteratee, fullNote.body, fullNote.title, notebook.title, tagTitles)
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
