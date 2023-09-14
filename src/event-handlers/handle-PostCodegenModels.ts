import { $TSContext } from "amplify-cli-core";
import { run as codegen } from "../commands/codegen";

export const run = async (context: $TSContext) => {
  await codegen(context);
};
