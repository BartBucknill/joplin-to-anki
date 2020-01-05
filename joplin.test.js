const { exportJoplin } = require('./joplin');

const url = process.env.JOPLIN_URL;
const token = process.env.JOPLIN_TOKEN;

const test = async() => {
    const result = await exportJoplin(url, token, '2020-01-04T06:27:06.000Z')
    .catch(console.error)
    console.log(result)
}
test()
