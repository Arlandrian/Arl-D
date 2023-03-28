// This will check if the node version you are running is the required
// Node version, if it isn't it will throw the following error to inform
// you.
if (Number(process.version.slice(1).split(".")[0]) < 16)
  throw new Error(
    "Node 16.x or higher is required. Update Node on your system."
  );
require("dotenv").config();

// Load up the discord.js library
const { Client, Collection } = require("discord.js");

// We also load the rest of the things we need in this file:
const { readdirSync } = require("fs");
const { exit } = require("process");
const { intents, partials, permLevels } = require("./config.js");
const logger = require("./modules/logger.js");
const settings = require("./modules/settings.js");
const db = ({
  initdb,
  setNickLogChannels,
  getNickLogChannels,
  getAllNickLogChannels,
} = require("./modules/database.js"));
// This is your client. Some people call it `bot`, some people call it `self`,
// some might call it `cootchie`. Either way, when you see `client.something`,
// or `bot.something`, this is what we're referring to. Your client.

const client = new Client({ intents, partials });

client.db = db;
// Aliases, commands and slash commands are put in collections where they can be
// read from, catalogued, listed, etc.
const commands = new Collection();
const aliases = new Collection();
const slashcmds = new Collection();
const appCommands = new Collection();

// Generate a cache of client permissions for pretty perm names in commands.
const levelCache = {};
for (let i = 0; i < permLevels.length; i++) {
  const thisLevel = permLevels[i];
  levelCache[thisLevel.name] = thisLevel.level;
}

// To reduce client pollution we'll create a single container property
// that we can attach everything we need to.
client.container = {
  commands,
  aliases,
  slashcmds,
  appCommands,
  levelCache,
};

// We're doing real fancy node 8 async/await stuff here, and to do that
// we need to wrap stuff in an anonymous function. It's annoying but it works.
const init = async () => {
  await initdb();

  // Here we load **commands** into memory, as a collection, so they're accessible
  // here and everywhere else.
  const commands = readdirSync("./commands/").filter((file) =>
    file.endsWith(".js")
  );
  for (const file of commands) {
    const props = require(`./commands/${file}`);
    logger.log(`Loading Command: ${props.help.name}. 👌`, "log");
    client.container.commands.set(props.help.name, props);
    props.conf.aliases.forEach((alias) => {
      client.container.aliases.set(alias, props.help.name);
    });
  }

  const folders = readdirSync("./commands/", { withFileTypes: true })
    .filter((file) => file.isDirectory())
    .map((folder) => folder.name);
  folders.forEach((foldername) => {
    const folderCommands = readdirSync("./commands/" + foldername).filter(
      (file) => file.endsWith(".js")
    );
    for (const file of folderCommands) {
      const props = require(`./commands/${foldername}/${file}`);
      logger.log(`Loading Command: ${props.help.name}. 👌`, "log");
      client.container.commands.set(props.help.name, props);
      props.conf.aliases.forEach((alias) => {
        client.container.aliases.set(alias, props.help.name);
      });
    }
  });

  // Now we load any **slash** commands you may have in the ./slash directory.
  const slashFiles = readdirSync("./slash").filter((file) =>
    file.endsWith(".js")
  );
  for (const file of slashFiles) {
    const command = require(`./slash/${file}`);
    const commandName = file.split(".")[0];
    logger.log(`Loading Slash command: ${commandName}. 👌`, "log");

    // Now set the name of the command with it's properties.
    client.container.slashcmds.set(command.commandData.name, command);
  }

  // Then we load events, which will include our message and ready event.
  const eventFiles = readdirSync("./events/").filter((file) =>
    file.endsWith(".js")
  );
  for (const file of eventFiles) {
    const eventName = file.split(".")[0];
    logger.log(`Loading Event: ${eventName}. 👌`, "log");
    const event = require(`./events/${file}`);
    // Bind the client to any event, before the existing argumentsS
    // provided by the discord.js event.
    // This line is awesome by the way. Just sayin'.
    client.on(eventName, event.bind(null, client));
  }

  // Threads are currently in BETA.
  // This event will fire when a thread is created, if you want to expand
  // the logic, throw this in it's own event file like the rest.
  client.on("threadCreate", (thread) => thread.join());

  client.on("ready", onClientReady);
  // runTest()
  // Here we login the client.
  client.login();

  // prevent application from stopping on an exception
  process.on("uncaughtException", function (err) {
    logger.log("Caught exception: ", err);
  });
  // End top-level async/await function.
};

init();

async function onClientReady() {
  // fetch all members
  client.guilds.cache.forEach(async (guild) => {
    members = await guild.members.fetch({ force: true });

    console.log("size of guild members: " + JSON.stringify(members));
    console.log("size of guild members: " + members.size);
    console.log("size of guild members: " + members.size());
    console.log("size of guild members: " + members.length);
  });

  // fetch all channels
  client.guilds.cache.forEach(async (guild) => {
    await guild.channels.fetch();
  });

  // fetch recent messages
  client.guilds.cache.forEach(async (guild) => {
    for (const channel of guild.channels.cache) {
      await channel.messages?.fetch({ limit: 100 });
    }
  });

  await registerApplicationCommands();

  // notify owner that bot started
  let user = await client.users.fetch(process.env.OWNER, false);
  if (user != null) {
    user.send(`Hello I'm started :)`);
  }
}

async function registerApplicationCommands() {
  try {
    for (const command of client.container.slashcmds.filter(
      (x) => x.commandData.type != null
    )) {
      commandName = command[0];
      cmd = command[1];
      logger.log(
        `Registering Application Command: ${cmd.commandData.name}. 👌`,
        "log"
      );
      client.container.appCommands.set(cmd.commandData.name, cmd);
      client.application.commands.create(cmd.commandData);
    }
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
}

async function deleteApplicationCommand(name) {
  if (client.application.commands.cache.size() == 0) {
    await client.application.commands.fetch();
  }
  let id = client.application.commands.cache.find((x) => x.name == name);
  await client.application.commands.delete(id);
}

function runTest() {
  const testFunc = require(`./commands/nicklog.js`);
  let ex = {
    guild: {
      id: "guild-id",
    },
    channel: {
      id: "chan-id",
      send: (msg) => console.log("sending message, content:" + msg),
    },
  };
  testFunc.run(client, ex, null, null);
}
