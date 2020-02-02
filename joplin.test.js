const assert = require('assert')
const { exporter, extractQuiz } = require('./joplin')
const dotenv = require('dotenv')
const { parsed: env } = dotenv.config()
const { noteBody } = require('./joplin-test-data/sample-note')
const test = async () => {
    console.log(env)
    const result = await exporter(env.JOPLIN_URL, env.JOPLIN_TOKEN, env.EXPORT_FROM_DATE, ()=>{})
        .catch(console.error)
    console.log(result)
}
test()

// describe('joplin exporter', function() {
//     describe('extractQuiz', function() {
//         it('should extract all 3 QA', function() {
//         const expected = [ { d1: '**Question:**\nShortcut to insert template in Joplin?\n',
//         d2: 'Answer:\ncmd + opt + i\n',
//         d3: '2020-01-11T17-37-49-563' },
//         { d1: '**Question:**\nShortcut to toggle editor layout in Joplin?\n',
//         d2: 'Answer:\ncmd + l (lowercase L)\n',
//         d3: '2020-01-11T17-40-16-643' },
//         { d1: '**Question:**\nHow to enter multiline edit mode in VS Code?\n',
//         d2: 'Answer:\nopt + cmd + up/down\n',
//         d3: '2020-01-11T17-41-12-703' } ]
//         const actual = []
//         const iteratee = (url, d1, d2, d3) => actual.push({d1, d2, d3})
//         extractQuiz(iteratee,  noteBody)
//         assert.deepStrictEqual(actual, expected)
//         })
//     })
// })
