// all copyrights gose to Def. --> https://discord.com/users/933856726770413578

module.exports = {
  name: "ping", // command name
  description: "ping pong command",  // commands description
  type: "CHAT_INPUT", // command type (slash commands is the "CHAT_INPUT")
  options: [ // array of command options
    { // command option
      name: "type", // option name
      description: "want to be the ping or the pong?", // option description
      type: "STRING", // option type
      required: true, // option required
      choices: [ // array of option choices
        { // the first choice
          name: "ping", // the choice name
          value: "ping",// the choice value
        },
        { // the second choice
          name: "pong", // the choice name
          value: "pong",// the choice value
        },
      ],
    },
  ],
  run: async (client, interaction, data) => {
    let typeOption = interaction.options.getString("type") // get the option we have insert
    if (typeOption == "ping") { // check if the option = ping
      interaction.followUp({ content: `pong 🏓\nLang: ${data.lang}\nPrefix: ${data.prefix}` }) // reply to the use with "pong 🏓" and the data you have insert in the dashboard
    }
    else if (typeOption == "pong") { // check if the option = pong
      interaction.followUp({ content: `ping 🏓\nLang: ${data.lang}\nPrefix: ${data.prefix}` }) // reply to the use with "ping 🏓" and the data you have insert in the dashboard
    }
  }
}