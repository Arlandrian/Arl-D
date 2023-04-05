// const discord = require("discord.js");
// const QuickChart = require('quickchart-js');

exports.run = async (client, interaction) => {
  return
  // eslint-disable-line no-unused-vars
  await interaction.deferReply({ ephemeral: true });


  let guildId = interaction.guildId
  let roleid = interaction.options._hoistedOptions[0].role.id
  const guild=client.guilds.cache[guildId]
  members = await guild.members.fetch({ force: true });
  // falan filan
  // Get all members then filter down to those with the given role ID
  // Note: Only works for up to 1000 members
  // const members = await client.members.fetch({ guildId, limit: 1000 });
  // const membersWithRole = members.filter(m => !!m.roles.find(r => r === role_id));
  // const membersWithRoleCount = membersWithRole.length;


  // let role = interaction.guild.roles.fetch(roleid)
  // let members = role.members
  // let memberCount = members.size
  // await interaction.editReply(memberCount);

  // let roleID = '3933783737379';
  // let memberCount = guild.roles.get(roleID).members.size;
  // message.channel.send(memberCount + " members have this role!");

  // const resp = await JSON.stringify(interaction.options._hoistedOptions);
  // interaction.editReply(resp);
  // // Create a message and send it to channel
  // const opts = interaction.options._hoistedOptions;
  // const labels = []
  // const data = []
  // opts.forEach(opt => {
  //   const roleIn=opt.role
  //   const id=roleIn.id
  //   const name=roleIn.name
  //   const color=roleIn.color

  //   const role = await client.guilds.cache.get(interaction.guildId).roles.fetch(id)
  //   const memberCount = role.members.size
  //   interaction.channel.send(name+" "+memberCount)

  //   // member names
  //   labels.push(role.name)
  //   // member count
  //   data.push(role)
  // });

  // const chart = new QuickChart();
  // const chartConf = {
  //   type: 'pie',
  //   data: {
  //     labels: labels,
  //     datasets: [{
  //       label: 'Roles',
  //       data: data
  //     }]
  //   }
  // };
  // chart.setConfig(chartConf)
  // chart.setWidth(500);
  // chart.setHeight(300);
  // const image = await chart.toBinary();
  // interaction.channel.send({ files: [{ attachment: image }]})
  // await interaction.editReply("Pie chart is ready");
};

exports.commandData = {
  name: "piechartrole",
  description:
    "Creates a pie chart for the given roles showing the ratio between them.",
  descriptionLocalizations: {},
  options: [
    {
      name: "role1",
      description: "plase specify a role",
      type: 8,
      required: true,
    },
    {
      name: "role2",
      description: "plase specify a role",
      type: 8,
      required: true,
    },
    {
      name: "role3",
      description: "plase specify a role",
      type: 8,
      required: false,
    },
    {
      name: "role4",
      description: "plase specify a role",
      type: 8,
      required: false,
    },
    {
      name: "role5",
      description: "plase specify a role",
      type: 8,
      required: false,
    },
    {
      name: "role6",
      description: "plase specify a role",
      type: 8,
      required: false,
    },
    {
      name: "role7",
      description: "plase specify a role",
      type: 8,
      required: false,
    },
    {
      name: "role8",
      description: "plase specify a role",
      type: 8,// ApplicationCommandOptionTypes.ROLE
      required: false,
    },
    {
      name: "role9",
      description: "plase specify a role",
      type: 3,
      required: false,
    },
  ],
  defaultPermission: true,
  type: 1,
};

// Set guildOnly to true if you want it to be available on guilds only.
// Otherwise false is global.
exports.conf = {
  permLevel: "User",
  guildOnly: true,
};
