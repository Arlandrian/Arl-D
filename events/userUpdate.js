const logger = require("../modules/logger.js");
const { getSettings } = require("../modules/functions.js");
// This event executes when a new member joins a server. Let's welcome them!

module.exports = (client, oldUser, newUser) => {
  // Load the guild's settings
  logger.log(oldUser, "log")
  logger.log("|||||||||||||||", "log")
  logger.log(newUser, "log")
};
