const db = { deleteUserSlowdown } = require("../modules/database.js")

exports.run = async (client, interaction) => { // eslint-disable-line no-unused-vars
  await interaction.deferReply({ ephemeral: true });
  // Check if the user is already throttled
  let opts = interaction.options._hoistedOptions;
  let member = opts[0].member

  let success = await db.deleteUserSlowDown(interaction.guild.id, member.id)
  if(success){
    await interaction.editReply(
      ":white_check_mark: => :cyclone: kullanıcı mesaj limiti kaldırıldı."
    );
  }else{
    await interaction.editReply(
      ":x: => :cyclone: kullanıcı mesaj limiti kaldırılamadı."
    );
  }
};

exports.commandData = {
  name: "slowdownRemove",
  description: "Remove message throttle from user.",
  descriptionLocalizations: {
    tr: "kullanıcının belli bir zaman aralığında atabildiği mesaj sayısını limitler.",
  },
  options: [
    {
      "name": "member",
      "description": "Member to slowdown.",
      descriptionLocalizations: {
        tr: "kullanıcı.",
      },
      "type": 6,
      "required": true
    },
  ],
  defaultPermission: true,
  type: 1
};

// Set guildOnly to true if you want it to be available on guilds only.
// Otherwise false is global.
exports.conf = {
  permLevel: "Moderator",
  guildOnly: true
};