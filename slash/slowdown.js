const db = { setUserSlowdown } = require("../modules/database.js")
const userMessageThrottler = require("../modules/throttler.js");

exports.run = async (client, interaction) => { // eslint-disable-line no-unused-vars
  await interaction.deferReply({ ephemeral: true });
  let opts = interaction.options._hoistedOptions;
  let member = opts[0].member
  let timeSec = opts[1].value
  let msgCount = opts.length > 2 ? opts[2].value : 1;

  let data = {
    id: member.id,
    timeSec: timeSec,
    msgCount: msgCount
  }
  let result = await db.setUserSlowdown(interaction.guild.id, member.id, data)
  if (result != "success") {
    await interaction.editReply(`Error: ${result}`);
  } else {
    userMessageThrottler.removeUser(interaction.guild.id, member.id)
    userMessageThrottler.addUser(interaction.guild.id, member.id)
    await interaction.editReply(`User can only send ${msgCount} messages in ${timeSec} seconds.`);
  }
};

exports.commandData = {
  name: "slowdown",
  description: "Throttle user messages.",
  descriptionLocalizations: {
    tr: "kullanıcının belli bir zaman aralığında atabildiği mesaj sayısını limitler.",
  },
  options: [
    {
      "name": "member",
      "description": "Member to slowdown.",
      descriptionLocalizations: {
        tr: "limitlenecek kullanıcı.",
      },
      "type": 6,
      "required": true
    },
    {
      "name": "timesec",
      "description": "Time seconds to wait between messages.",
      descriptionLocalizations: {
        tr: "zaman aralığı saniye cinsinden.",
      },
      "type": 4,
      "required": true,
      "minValue": 5,
      "minValue": 600,
    },
    {
      "name": "msgcount",
      "description": "Allowed message count for the time period.",
      descriptionLocalizations: {
        tr: "zaman aralığında atılabilecek mesaj sayısı.",
      },
      "type": 4,
      "required": false,
      "minValue": 1,
    }
  ],
  defaultPermission: true,
  type: 1
};

// Set guildOnly to true if you want it to be available on guilds only.
// Otherwise false is global.
exports.conf = {
  permLevel: "Administrator",
  guildOnly: true
};