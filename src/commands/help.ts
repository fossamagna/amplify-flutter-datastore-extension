import { $TSContext } from "amplify-cli-core";

const category = "flutter-datastore-extension";

export const run = async (context: $TSContext) => {
  const header = `amplify ${category} <subcommands>`;

  const commands = [
    {
      name: "generate",
      description:
        "Generate Flutter extensions file for DataStore operations.\nThis command is automatically executed when run 'amplify codegen models'.",
    },
  ];

  context.amplify.showHelp(header, commands);

  context.print.info("");
};
