const logger = require("../modules/logger.js");
const { getSettings, permlevel } = require("../modules/functions.js");
const config = require("../config.js");
const userMessageThrottler = require("../modules/throttler.js");
const spammerDetector = require("../modules/spammerDetector.js");
const db = { getUserSlowdown } = require("../modules/database.js")

const userBannedGifUrl = "https://tenor.com/view/basketball-blocked-gif-12894880"
const userBannedNotification = (member) => `User has been banned.\nReason: Spam\nGuild Id-Name: ${member.guild.id}-${member.guild.name}\nUser Id-Tag: ${member.user.id}-${member.user.tag}\n`+userBannedGifUrl

// The MESSAGE event runs anytime a message is received
// Note that due to the binding of client to every event, every event
// goes `client, other, args` when this function is run.

module.exports = async (client, message) => {
  // Grab the container from the client to reduce line length.
  const { container, metrics } = client;

  metrics.messageCounter.inc({ user_type: message.author.bot?"bot":"human"})
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if (message.author.bot) return;

  // Grab the settings for this server from Enmap.
  // If there is no guild, get default conf (DMs)
  const settings = message.settings = getSettings(message.guild);

  // Trigger DM received
  if(message.channel.type == 'DM'){
    onDMReceived(message);
  }else{
    if (!await checkForSlowdown(message)) return;
     // check if the this is a spammer
    if (spammerDetector.detectAndHandleSpam(message, async (member) => {
      await logger.notifyBotOwner(client, userBannedNotification(member))
    })) return;
  }

  // Checks if the bot was mentioned via regex, with no message after it,
  // returns the prefix. The reason why we used regex here instead of
  // message.mentions is because of the mention prefix later on in the
  // code, would render it useless.
  const prefixMention = new RegExp(`^<@!?${client.user.id}> ?$`);
  if (message.content.match(prefixMention)) {
    return message.reply(`My prefix on this guild is \`${settings.prefix}\``);
  }

  // It's also good practice to ignore any and all messages that do not start
  // with our prefix, or a bot mention.
  const prefix = new RegExp(`^<@!?${client.user.id}> |^\\${settings.prefix}`).exec(message.content);
  // This will return and stop the code from continuing if it's missing
  // our prefix (be it mention or from the settings).
  if (!prefix) return;
    
  // Here we separate our "command" name, and our "arguments" for the command.
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(prefix[0].length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // If the member on a guild is invisible or not cached, fetch them.
  if (message.guild && !message.member) await message.guild.members.fetch(message.author);


  // Get the user or member's permission level from the elevation
  const level = permlevel(message);

  // Check whether the command, or alias, exist in the collections defined
  // in app.js.
  const cmd = container.commands.get(command) || container.commands.get(container.aliases.get(command));
  // using this const varName = thing OR otherThing; is a pretty efficient
  // and clean way to grab one of 2 values!
  if (!cmd) return;

  // Some commands may not be useable in DMs. This check prevents those commands from running
  // and return a friendly error message.
  if (cmd && !message.guild && cmd.conf.guildOnly)
    return message.channel.send("This command is unavailable via private message. Please run this command in a guild.");

  if (!cmd.conf.enabled) return;

  if (level < container.levelCache[cmd.conf.permLevel]) {
    if (settings.systemNotice === "true") {
      return message.channel.send(`You do not have permission to use this command.
Your permission level is ${level} (${config.permLevels.find(l => l.level === level).name})
This command requires level ${container.levelCache[cmd.conf.permLevel]} (${cmd.conf.permLevel})`);
    } else {
      return;
    }
  }

  // To simplify message arguments, the author's level is now put on level (not member so it is supported in DMs)
  // The "level" command module argument will be deprecated in the future.
  message.author.permLevel = level;
  
  message.flags = [];
  while (args[0] && args[0][0] === "-") {
    message.flags.push(args.shift().slice(1));
  }
  // If the command exists, **AND** the user has permission, run it.
  try {
    await cmd.run(client, message, args, level);
    logger.log(`${config.permLevels.find(l => l.level === level).name} ${message.author.id} ran command ${cmd.help.name}`, "cmd");
  } catch (e) {
    console.error(e);
    message.channel.send({ content: `There was a problem with your request.\n\`\`\`${e.message}\`\`\`` })
      .catch(e => console.error("An error occurred replying on an error", e));
  }
};

async function onDMReceived(message){
  logger.log(`Received DM message:: ${message.author.tag}: ${message.content}`);
}

async function checkForSlowdown(message) {
  let slowdown = await db.getUserSlowdown(message.guildId, message.author.id)
  if (slowdown != null) {
    // console.log(`slowdown: ${slowdown.timeSec} ${slowdown.msgCount}`)
    if (!userMessageThrottler.exists(message.guildId, message.author.id) ){
      console.log(`userMessageThrottler adding user. setting slowdown to ${slowdown.timeSec} with limit ${slowdown.msgCount}`)
      userMessageThrottler.addUser(message.guildId, message.author.id, slowdown.msgCount, slowdown.timeSec*1000)
    }

    if(!userMessageThrottler.onSendMessage(message.guildId, message.author.id)){
      // console.log(`throttled! cant send message`)
      await message.delete()
      await message.author.send(`Yavaşlatıldığınız için mesajınız silindi. ${slowdown.timeSec} saniye içinde ${slowdown.msgCount} mesaj gönderebilirsiniz.`)
      if (message.member != null) {
        await message.member.timeout(slowdown.timeSec*1000, 'slowdownda yazmaya çalıştı.')
      }
      return false
    }
    // console.log(`Throttle not exceeded! Can send message.`)
  }
  return true
}
