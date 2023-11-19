var exec = require('child_process').exec;
function execute(command, callback){
    exec(command, function(error, stdout, stderr){ callback(stdout); });
};

const discord = require("discord.js");
exports.run = async (client, interaction) => { 
  await interaction.deferReply({ ephemeral: true });
  let opts = interaction.options._hoistedOptions;
  let cmd = opts[0].value

  // Create embed message
  execute(cmd, (output)=>{
    const atc = new discord.MessageAttachment(Buffer.from(output), "stdout.txt");
    interaction.editReply({ files: [atc] });
  });
};

exports.commandData = {
  name: "exec",
  description: "Run a command in the machine.",
  descriptionLocalizations:  {},
  options: [
    {
      "name": "command",
      "description": "command",
      "type": 3,
      "required": true
    }
  ],
  defaultMemberPermissions: discord.Permissions.FLAGS.BAN_MEMBERS,
  type: 1
};

// Set guildOnly to true if you want it to be available on guilds only.
// Otherwise false is global.
exports.conf = {
  permLevel: "Bot Owner",
  guildOnly: false
};