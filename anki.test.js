const { setup, importer } = require('./anki');
const dotenv = require('dotenv')
const { parsed: env } = dotenv.config()

const testImport = async() => {
    const result = await importer(env.ANKI_URL, '444 TEST question', '444 TEST answer', '2020-01-05T16-01-24-455')
    .catch(console.error)
    console.log(result)
}

const testSetup = async() => {
    const result = await setup(env.ANKI_URL)
    .catch(console.error)
    console.log(result)

}

const run = async() => {
    await testImport()
    await testSetup()
}
run()
