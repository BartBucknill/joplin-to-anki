const rp = require('request-promise-native');
const cheerio = require('cheerio')

const extractQuiz = (iteratee, body, title) => {
    const $ = cheerio.load(body)
    const quizID = $('.quiz').attr('data-id')
    const question = $('.question').text()
    const answer = $('.answer').text()
    if (quizID && question && answer) {
        return iteratee(process.env.ANKI_URL, question, answer, quizID)
    }
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

const urlGen = (baseURL, resource, id) => {
    let url = `${baseURL}/${resource}`
    if (id) url += `/${id}`
    return url
}

const get = (url, token, fields) => {
    const params = paramsGen(token, fields)
    return rp({uri: url + params, json: true})
}

const exporter = async(url, token, datetime, iteratee) => {
    try {
        const date = new Date(datetime);
        const notes = await get(urlGen(url, 'notes'), token, 'id,user_updated_time')
        notes.forEach(async note => {
            const noteDate = new Date(note.user_updated_time)
            if (noteDate.getTime() > date.getTime()) {
                const fullNote = await get(urlGen(url, 'notes', note.id), token, 'title,body')
                extractQuiz(iteratee, fullNote.body, fullNote.title)
            }
        })
    } catch (error) {
       console.error('Oops, something went wrong: ', error)
    }

}

module.exports = {
    ping,
    exporter,
}
