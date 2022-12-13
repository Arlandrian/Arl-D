const axios = require('axios');

exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  await githubWorkflowTrigger();
};

async function githubWorkflowTrigger() {
  const OWNER = process.env.GITHUB_OWNER
  const REPO = process.env.GITHUB_REPO
  const WORKFLOW_ID = "build-deploy.yml"
  const GITHUB_TOKEN = process.env.GITHUB_WORKFLOW_TOKEN

  const data = {
    ref: "master"
    // ,
    // inputs: {
    //   "name": "Mona the Octocat",
    //   "home": "San Francisco, CA"
    // }
  }
  const URL = `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_ID}/dispatches`
  const response = await axios.post(
    URL,
    JSON.stringify(data),
    {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': 'Bearer ' + GITHUB_TOKEN,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  ).catch(e=>{
    console.error(e)
  });
}

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: "Bot Owner"
};

exports.help = {
  name: "deploy",
  category: "System",
  description: "This will deploy the whole application from ",
  usage: "deploy"
};
