const { ankiSetup, ankiImport } = require('./anki');

const url = process.env.ANKI_URL;

const testImport = async() => {
    const result = await ankiImport(url, '444 TEST question', '444 TEST answer', '2020-01-05T16-01-24-455')
    .catch(console.error)
    console.log(result)
}

const testSetup = async() => {
    const result = await ankiSetup(url)
    .catch(console.error)
    console.log(result)

}

const run = async() => {
    await testImport()
    await testSetup()
}
run()
