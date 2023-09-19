import { PluginFunction, Types } from "@graphql-codegen/plugin-helpers";
import { GraphQLSchema, parse, visit } from "graphql";
import { printSchemaWithDirectives } from "@graphql-tools/utils";
import { AppSyncDartExtensionVisitor } from "./visitors/appsync-dart-extension-visitor";
import { RawAppSyncModelConfig } from "@aws-amplify/appsync-modelgen-plugin/lib/visitors/appsync-visitor";
export { addToSchema } from "@aws-amplify/appsync-modelgen-plugin";

export const plugin: PluginFunction<RawAppSyncModelConfig> = (
  schema: GraphQLSchema,
  rawDocuments: Types.DocumentFile[],
  config: RawAppSyncModelConfig,
) => {
  const visitor = new AppSyncDartExtensionVisitor(schema, config, {
    selectedType: config.selectedType,
    generate: config.generate,
  });
  if (schema) {
    const schemaStr = printSchemaWithDirectives(schema);
    const node = parse(schemaStr);
    visit(node, {
      leave: visitor,
    });
    return visitor.generate();
  }
  return "";
};
