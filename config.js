const Configstore = require("configstore");
const packageJson = require("./package.json");

const defaultExportFromDate = new Date();
defaultExportFromDate.setDate(defaultExportFromDate.getDate() - 1);

const defaultConfigs = {
  ankiURL: "http://localhost:41184",
  joplinURL: "http://localhost:8765",
  exportFromDate: defaultExportFromDate,
};

const config = new Configstore(packageJson.name);

module.exports = {
  getAll() {
    return config.all;
  },
  set(key, value) {
    config.set(key, value);
  },
  get(key) {
    return config.get(key);
  },
  getWithFallback(key) {
    const found = config.get(key);
    if (found) {
      return found;
    }
    return defaultConfigs[key];
  },
};
