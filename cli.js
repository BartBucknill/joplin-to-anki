const { program } = require("commander");
const jta = require("./joplin-to-anki");
const configStore = require("./config");

program.version("0.0.0");

program
  .requiredOption(
    "-t, --joplintoken <token>",
    "token for Joplin Web Clipper API",
    configStore.get("joplinToken")
  )
  .option(
    "-d, --date <ISO Time String>",
    "joplin notes updated after this date will be exported. Defaults to configured value or now - 1 day",
    configStore.getWithFallback("exportFromDate")
  )
  .option(
    "-j, --joplinurl <URL>",
    "URL for Joplin Web Clipper API",
    configStore.getWithFallback("joplinURL")
  )
  .option(
    "-a, --ankiurl <URL>",
    "URL for Anki Connect API",
    configStore.getWithFallback("ankiURL")
  );
//TODO
//   .option("-v, --verbose", "Enable verbose logs")
//   .option("--debug", "Enable debug logs (verbose logs and more)")

program
  .command("run")
  .description("export from Joplin to Anki")
  .action(async () => {
    await jta.run(
      program.joplinurl,
      program.joplintoken,
      program.date,
      program.ankiurl
    );
  });

const config = program.command("config").description("Get/set configs for JTA");

config
  .command("set")
  .description(
    "Set options in config; these options will be used as default by JTA"
  )
  .action(() => {
    configStore.set("joplinURL", program.joplinurl);
    configStore.set("ankiURL", program.ankiurl);
    configStore.set("joplinToken", program.joplintoken);
    configStore.set("exportFromDate", program.date);
    console.log(configStore.getAll());
  });

config
  .command("get")
  .description("Get options in config")
  .action(() => {
    console.log(configStore.getAll());
  });

program.parse(process.argv);
