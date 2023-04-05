const discord = require("discord.js");
//const {ApplicationCommandOptionTypes, ApplicationCommandTypes} = require("discord.js/typings/enums")
const logger = require("../modules/logger")
const videoedit = require("../modules/videoedit")
exports.run = async (client, interaction) => { // eslint-disable-line no-unused-vars
  await interaction.deferReply({ ephemeral: false });

  let opts=interaction.options._hoistedOptions
  const videoURL=opts[0].value
  const audioURL=opts[1].value
  const videoStartSec=opts[2].value
  const videoEndSec=opts[3].value
  const audioStartSec=opts[4].value
  const audioEndSec=opts[5].value
  await interaction.editReply("video düzenleniyor");
  await videoedit.downloadVideoAndAudio(videoURL, audioURL, videoStartSec, videoEndSec, audioStartSec, audioEndSec, async (videoPath)=>{
    console.debug("cmd::videoedit: sending attachment file "+videoPath)
    const videoAttachment = new discord.MessageAttachment(videoPath);
    await interaction.editReply(videoAttachment)
  })

  // await interaction.editReply("Video düzenlendi.")
};

exports.commandData = {
  name: "videoedit",
  //description: "İlk videonun görüntüsüyle ikinci videonun sesini birleştirir. Sadece youtube linkleri çalışır.",
  description: "Cut a video and audio from youtube.",
  descriptionLocalizations: {
    "tr": "İlk videonun görüntüsüyle ikinci videonun sesini birleştirir. Sadece youtube linkleri çalışır."
  },
  options: [
    {
      "name": "videourl",
      "description": "video youtube url",
      "descriptionLocalizations": {
        "tr": "Videonun linki. (sadece youtube)"
      },
      "type": 3, 
      "required": true
    },
    {
      "name": "audiourl",
      "description": "Audio youtube url",
      "descriptionLocalizations": {
        "tr": "Sesin linki. (sadece youtube)"
      },
      "type": 3,
      "required": true
    },
    {
      "name": "videostartsec",
      "description": "video start point for the cut",
      "descriptionLocalizations": {
        "tr": "videoda kesilmeye baslanacak noktanin saniyesi"
      },
      "type": 4,
      "required": true,
      "min_value": 0,
      "max_value": 7200
    },
    {
      "name": "videoendsec",
      "description": "video end point for the cut",
      "descriptionLocalizations": {
        "tr": "videoda kesilmenin biteceği noktanin saniyesi"
      },
      "type": 4,
      "required": true,
      "min_value": 0,
      "max_value": 7200
    },
    {
      "name": "audiostartsec",
      "description": "audio start point for the cut",
      "descriptionLocalizations": {
        "tr": "sesde kesilmeye baslanacak noktanin saniyesi"
      },
      "type": 4,
      "required": true,
      "min_value": 0,
      "max_value": 7200
    },
    {
      "name": "audioendsec",
      "description": "audio end point for the cut",
      "descriptionLocalizations": {
        "tr": "sesde kesilmenin biteceği noktanin saniyesi"
      },
      "type": 4,
      "required": true,
      "min_value": 0,
      "max_value": 7200
    }
  ],
  defaultPermission: true,
  type: 1
};

// Set guildOnly to true if you want it to be available on guilds only.
// Otherwise false is global.
exports.conf = {
  permLevel: "Moderator",
  guildOnly: false
};