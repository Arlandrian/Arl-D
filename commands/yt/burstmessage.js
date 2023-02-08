const { version } = require("discord.js");
const { codeBlock } = require("@discordjs/builders");
const { DurationFormatter } = require("@sapphire/time-utilities");
const youtube = require("../../youtube")
const durationFormatter = new DurationFormatter();

exports.run = async (client, message, args, level) => { 
  let burstCount = Number(args[0])
  // Check if valid arg
  if(isNaN(burstCount) || burstCount == null || burstCount < 1){
    message.reply("invalid input");
    return
  }

  const t0 = performance.now();
  let msg = args.slice(1).join(' ');
  let promises = []
  for(let i=0; i < burstCount; i++){
    promises.push(youtube.sendLiveChatMessage(msg));
  }

  let results = await Promise.allSettled(promises)

  for(let i=0; i < results.length; i++){
    let res = results[i]
    if(res.error != null) {
      message.reply(res.error)
      return
    }
  }

  const t1 = performance.now();
  const reply = `${burstCount} messages sent in ${(t1-t0)} milliseconds.`
  message.reply(reply);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["ytburst","ytburstmsg","ytburstmessage"],
  permLevel: "Bot Owner"
};

exports.help = {
  name: "youtube send burst message",
  category: "Youtube Bot",
  description: "Sends the same message multiple times at once.",
  usage: "ytburstmessage 10 'your message here'"
};
