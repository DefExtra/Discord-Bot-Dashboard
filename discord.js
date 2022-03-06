// all copyrights gose to def --> http://discord.com/users/933856726770413578


const fs = require("fs");
const slashCommandsMap = new Map();

module.exports = async (discord, client, db) => {
  let dirname = __dirname;
  const arrayOfSlashCommands = [];
  fs.readdirSync(dirname + "/commands/").forEach(async (dir) => {
    fs.readdirSync(dirname + "/commands/" + dir + "/").map((value) => {
      const file = require(dirname + "/commands/" + dir + "/" + value);
      if (!file?.name) return;
      slashCommandsMap.set(file.name, file);

      if (["MESSAGE", "USER"].includes(file.type)) delete file.description;
      arrayOfSlashCommands.push(file);
    });
  });
  client.on("ready", async () => {
    console.log("bot in load...")
    await client.application.commands.set(arrayOfSlashCommands);
  })
  .on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
      // data
      let data;
      let prefix = db.fetch(`Prefix_${interaction.guild.id}`) || "None";
      let lang = db.fetch(`Lang_${interaction.guild.id}`) || "None";
      data = {
        prefix: prefix,
        lang: lang
      }
      // handler
      const cmd = slashCommandsMap.get(interaction.commandName);
      if (!cmd) return;
      await interaction.deferReply({ ephemeral: true }).catch(() => {});
      interaction.member = interaction.guild.members.cache.get(interaction.user.id);
      interaction.author = interaction.user;
      setTimeout(() => {
        cmd.run(client, interaction, data);
      }, 2404)
    }
  });
}