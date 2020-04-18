const levelDebug = "debug";
const levelVerbose = "verbose";
const levelApplication = "application";
function newLogger(logLevel) {
  return (level, msg) => {
    if (level == logLevel) {
      console.log(msg);
      return;
    }
    if (logLevel == levelVerbose && level == levelApplication) {
      console.log(msg);
      return;
    }
    if (logLevel == levelDebug) {
      console.log(msg);
      return;
    }
  };
}

module.exports = {
  newLogger,
  levelDebug,
  levelVerbose,
  levelApplication,
};
