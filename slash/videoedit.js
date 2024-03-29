const discord = require("discord.js");
//const {ApplicationCommandOptionTypes, ApplicationCommandTypes} = require("discord.js/typings/enums")
const logger = require("../modules/logger");
const videoedit = require("../modules/videoedit");
exports.run = async (client, interaction) => {
  // eslint-disable-line no-unused-vars
  await interaction.deferReply({ ephemeral: false });
  const opts = interaction.options._hoistedOptions;
  let videoURL = "";
  let audioURL = "";
  let videoStartSec = "";
  let videoEndSec = "";
  let audioStartSec = "";
  let audioEndSec = "";
  logger.log("subcommand: " + interaction.options.getSubcommand());
  switch (interaction.options.getSubcommand()) {
    case "hepsi":
      videoURL = opts[0].value;
      audioURL = opts[1].value;
      videoStartSec = opts[2].value;
      videoEndSec = opts[3].value;
      audioStartSec = opts[4].value;
      audioEndSec = opts[5].value;
      break;
    case "askinolayim":
      videoURL = opts[0].value;
      audioURL = "https://www.youtube.com/watch?v=f0-RYStvdkc";
      videoStartSec = opts[1].value;
      videoEndSec = opts[2].value;
      audioStartSec = getOption(opts, "audiostartsec", 26);
      audioEndSec = getOption(opts, "audioendsec", 156);
      break;
    case "cennettencicek":
      videoURL = opts[0].value;
      audioURL = "https://www.youtube.com/watch?v=BtuBu9FecKM";
      videoStartSec = opts[1].value;
      videoEndSec = opts[2].value;
      audioStartSec = getOption(opts, "audiostartsec", 0);
      audioEndSec = getOption(opts, "audioendsec", 45);
      break;
    case "dertetmeler":
      videoURL = opts[0].value;
      audioURL = "https://www.youtube.com/watch?v=A5pikichwRI";
      videoStartSec = opts[1].value;
      videoEndSec = opts[2].value;
      audioStartSec = getOption(opts, "audiostartsec", 0);
      audioEndSec = getOption(opts, "audioendsec", 31);
      break;
    case "imparator":
      videoURL = opts[0].value;
      audioURL = "https://youtu.be/ceK95I_CK9w";
      videoStartSec = opts[1].value;
      videoEndSec = opts[2].value;
      audioStartSec = getOption(opts, "audiostartsec", 0);
      audioEndSec = getOption(opts, "audioendsec", 11);
      break;
  }

  await interaction.editReply(
    ":factory_worker: => :cyclone:video düzenleniyor, lütfen bekleyin...:cyclone:"
  );
  const startTime = performance.now();
  await videoedit.downloadVideoAndAudioEdit(
    videoURL,
    audioURL,
    videoStartSec,
    videoEndSec,
    audioStartSec,
    audioEndSec,
    async (videoPath) => {
      console.debug("cmd::videoedit: sending attachment file " + videoPath);
      const videoAttachment = new discord.MessageAttachment(videoPath);
      const endTime = performance.now();
      const elapsedTime = endTime - startTime;
      await interaction.editReply(`video edit hazır:white_check_mark: ${elapsedTime.TS()}`);
      await interaction.editReply({ files: [videoAttachment] });
    }
  );
};

function getOption(opts, name, defValue) {
  const provided = opts.find((x) => x.name == name);
  if (provided == null) {
    return defValue;
  } else {
    return provided.value;
  }
}

const subCommandOptions = [
  {
    name: "videourl",
    description: "video youtube url",
    descriptionLocalizations: {
      tr: "Videonun linki. (sadece youtube)",
    },
    type: 3,
    required: true,
  },
  {
    name: "videostartsec",
    description: "video start point for the cut",
    descriptionLocalizations: {
      tr: "videoda kesilmeye baslanacak noktanin saniyesi",
    },
    type: 4,
    required: true,
    min_value: 0,
    max_value: 7200,
  },
  {
    name: "videoendsec",
    description: "video end point for the cut",
    descriptionLocalizations: {
      tr: "videoda kesilmenin biteceği noktanin saniyesi",
    },
    type: 4,
    required: true,
    min_value: 0,
    max_value: 7200,
  },
  {
    name: "audiostartsec",
    description: "audio start point for the cut",
    descriptionLocalizations: {
      tr: "sesde kesilmeye baslanacak noktanin saniyesi",
    },
    type: 4,
    required: false,
    min_value: 0,
    max_value: 7200,
  },
  {
    name: "audioendsec",
    description: "audio end point for the cut",
    descriptionLocalizations: {
      tr: "sesde kesilmenin biteceği noktanin saniyesi",
    },
    type: 4,
    required: false,
    min_value: 0,
    max_value: 7200,
  },
];

exports.commandData = {
  name: "videoedit",
  //description: "İlk videonun görüntüsüyle ikinci videonun sesini birleştirir. Sadece youtube linkleri çalışır.",
  description: "Cut a video and audio from youtube.",
  descriptionLocalizations: {
    tr: "İlk videonun görüntüsüyle ikinci videonun sesini birleştirir. Sadece youtube linkleri çalışır.",
  },
  options: [
    {
      name: "hepsi",
      description: "Both video and audio url needs to be specified",
      descriptionLocalizations: {
        tr: "Hem videoyu hem sesi belirtmeniz gerekir.",
      },
      type: "SUB_COMMAND",
      options: [
        {
          name: "videourl",
          description: "video youtube url",
          descriptionLocalizations: {
            tr: "Videonun linki. (sadece youtube)",
          },
          type: 3,
          required: true,
        },
        {
          name: "audiourl",
          description: "Audio youtube url",
          descriptionLocalizations: {
            tr: "Sesin linki. (sadece youtube)",
          },
          type: 3,
          required: true,
        },
        {
          name: "videostartsec",
          description: "video start point for the cut",
          descriptionLocalizations: {
            tr: "videoda kesilmeye baslanacak noktanin saniyesi",
          },
          type: 4,
          required: true,
          min_value: 0,
          max_value: 7200,
        },
        {
          name: "videoendsec",
          description: "video end point for the cut",
          descriptionLocalizations: {
            tr: "videoda kesilmenin biteceği noktanin saniyesi",
          },
          type: 4,
          required: true,
          min_value: 0,
          max_value: 7200,
        },
        {
          name: "audiostartsec",
          description: "audio start point for the cut",
          descriptionLocalizations: {
            tr: "sesde kesilmeye baslanacak noktanin saniyesi",
          },
          type: 4,
          required: true,
          min_value: 0,
          max_value: 7200,
        },
        {
          name: "audioendsec",
          description: "audio end point for the cut",
          descriptionLocalizations: {
            tr: "sesde kesilmenin biteceği noktanin saniyesi",
          },
          type: 4,
          required: true,
          min_value: 0,
          max_value: 7200,
        },
      ],
    },
    {
      name: "askinolayim",
      description: "adds askin olayim music to given video",
      descriptionLocalizations: {
        tr: "Verilen video aralığında aşkın olayım müziğini ekler",
      },
      type: "SUB_COMMAND",
      options: subCommandOptions,
    },
    {
      name: "cennettencicek",
      description: "adds 'cennetten cicek mi topluyorum' music to given video",
      descriptionLocalizations: {
        tr: "Verilen video aralığında 'cennetten cicek mi topluyorum' müziğini ekler",
      },
      type: "SUB_COMMAND",
      options: subCommandOptions,
    },
    {
      name: "dertetmeler",
      description: "adds 'seni dert etmeler' music to given video",
      descriptionLocalizations: {
        tr: "Verilen video aralığında 'seni dert etmeler' müziğini ekler",
      },
      type: "SUB_COMMAND",
      options: subCommandOptions,
    },
    {
      name: "imparator",
      description: "adds 'imparator' music to given video",
      descriptionLocalizations: {
        tr: "Verilen video aralığında 'imparator' müziğini ekler",
      },
      type: "SUB_COMMAND",
      options: subCommandOptions,
    },
  ],
  defaultPermission: true,
  type: 1,
};

// Set guildOnly to true if you want it to be available on guilds only.
// Otherwise false is global.
exports.conf = {
  permLevel: "Moderator",
  guildOnly: false,
};
