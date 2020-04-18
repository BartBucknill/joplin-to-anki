const rp = require("request-promise-native");
const { levelApplication, levelVerbose, levelDebug } = require("./log");

const healthyPingResponse = "JoplinClipperServer";

const newClient = (url, token, log) => {
  if (!url) {
    throw new Error("No url for Joplin Api provided");
  }
  if (!token) {
    throw new Error("No token for Joplin Api provided");
  }
  return {
    url,
    token,
    log,
    ping() {
      return rp(this.urlGen("ping"));
    },

    paramsGen(fields) {
      let params = `?token=${this.token}`;
      if (fields) params += `&fields=${fields}`;
      return params;
    },

    urlGen(resource, id, subResource) {
      let url = `${this.url}/${resource}`;
      if (id) url += `/${id}`;
      if (subResource) url += `/${subResource}`;
      return url;
    },

    request(url, method, body, fields, parseJSON = true, encoding) {
      const params = this.paramsGen(fields);
      const options = { method, uri: url + params, json: parseJSON };
      this.log(levelDebug, `Request options: ${JSON.stringify(options)}`);
      if (body) {
        options.body = body;
      }
      if (encoding) {
        options.encoding = encoding;
      }
      return rp(options);
    },

    async health() {
      const response = await this.ping();
      if (response != healthyPingResponse) {
        throw new Error(
          `Did not receive expected response from Joplin Web Clipper API at ${this.url}/ping\nResponse: ${response}\nExiting.`
        );
      }
      this.log(levelVerbose, "Joplin API Healthy");
    },
  };
};

module.exports = {
  newClient,
};
