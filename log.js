const newLogger = function (debug) {
  return (msg) => {
    if (!!debug) {
      console.log(msg);
    }
  };
};

module.exports = {
  newLogger,
};
