const rp = require("request-promise-native");
const { newLogger } = require("./log");

const healthyPingResponse = "JoplinClipperServer";

const ping = function () {
  return rp(this.urlGen("ping"));
};

const paramsGen = function (fields) {
  let params = `?token=${this.token}`;
  if (fields) params += `&fields=${fields}`;
  return params;
};

const urlGen = function (resource, id, subResource) {
  let url = `${this.url}/${resource}`;
  if (id) url += `/${id}`;
  if (subResource) url += `/${subResource}`;
  return url;
};

const request = function (
  url,
  method,
  body,
  fields,
  parseJSON = true,
  encoding
) {
  const params = this.paramsGen(fields);
  const options = { method, uri: url + params, json: parseJSON };
  this.log(`Request options: ${JSON.stringify(options)}`);
  if (body) {
    options.body = body;
  }
  if (encoding) {
    options.encoding = encoding;
  }
  return rp(options);
};

const health = async function () {
  const response = await this.ping();
  if (response != healthyPingResponse) {
    throw new Error(
      `Did not receive expected response from Anki api at ${this.url}/ping\nResponse: ${response}\nExiting.`
    );
  }
  this.log("Joplin API Healthy");
};

const newClient = (url, token, debug) => {
  if (!url) {
    throw new Error("No url for Joplin Api provided");
  }
  if (!token) {
    throw new Error("No token for Joplin Api provided");
  }
  return {
    url,
    token,
    log: newLogger(debug),
    health,
    ping,
    request,
    urlGen,
    paramsGen,
  };
};

module.exports = {
  newClient,
};
