import fs from "fs-extra";
import path from "node:path";
import glob from "glob";
import { parse } from "graphql";
import { $TSContext } from "amplify-cli-core";
import { generateExtensions } from "../extension";

export const run = async (context: $TSContext) => {
  const allApiResources = await context.amplify.getResourceStatus("api");
  const apiResource = allApiResources.allResources.find(
    (resource: any) =>
      resource.service === "AppSync" &&
      resource.providerPlugin === "awscloudformation"
  );

  if (!apiResource) {
    context.print.info("No AppSync API configured. Please add an API");
    return;
  }

  const backendPath = await context.amplify.pathManager.getBackendDirPath();
  const apiResourcePath = path.join(
    backendPath,
    "api",
    apiResource.resourceName
  );

  const directiveDefinitions = await context.amplify.executeProviderUtils(
    context,
    "awscloudformation",
    "getTransformerDirectives",
    {
      resourceDir: apiResourcePath,
    }
  );

  const schemaContent = loadSchema(apiResourcePath);
  const schema = parse(schemaContent);

  const modelFolder = "lib/models";
  const generatedOutput = await generateExtensions({
    schema,
    directives: directiveDefinitions,
    baseOutputDir: modelFolder,
  });

  Object.entries(generatedOutput).map(([filename, content]) => {
    fs.ensureFileSync(filename);
    fs.writeFileSync(filename, content);
  });

  context.print.info(
    `Successfully generated models. Generated models can be found in ${modelFolder}`
  );
};

function loadSchema(apiResourcePath: string) {
  const schemaFilePath = path.join(apiResourcePath, "schema.graphql");
  const schemaDirectory = path.join(apiResourcePath, "schema");
  if (fs.pathExistsSync(schemaFilePath)) {
    return fs.readFileSync(schemaFilePath, "utf8");
  }
  if (
    fs.pathExistsSync(schemaDirectory) &&
    fs.lstatSync(schemaDirectory).isDirectory()
  ) {
    // search recursively for graphql schema files inside `schema` directory
    const schemas = glob.sync([path.join(schemaDirectory, "**/*.graphql")]);
    return schemas.map((file) => fs.readFileSync(file, "utf8")).join("\n");
  }

  throw new Error("Could not load the schema");
}
