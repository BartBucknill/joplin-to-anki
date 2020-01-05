const { exporter } = require('./joplin')
const dotenv = require('dotenv')
const { parsed: env } = dotenv.config()

const test = async () => {
    console.log(env)
    const result = await exporter(env.JOPLIN_URL, env.JOPLIN_TOKEN, '2020-01-04T06:27:06.000Z')
        .catch(console.error)
    console.log(result)
}
test()
