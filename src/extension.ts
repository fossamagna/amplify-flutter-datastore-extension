import path from "node:path";
import type { DocumentNode } from "graphql";
import { codegen } from "@graphql-codegen/core";
import type { Types } from "@graphql-codegen/plugin-helpers";
import { DART_SCALAR_MAP } from "@aws-amplify/appsync-modelgen-plugin/lib/scalars";
import { plugin, addToSchema } from "./plugin";

export type GenerateExtensionsOptions = {
  schema: DocumentNode;
  directives: string;
  baseOutputDir: string,
}

export type GeneratedOutput = {
  [filepath: string]: string;
};

export async function generateExtensions(options: GenerateExtensionsOptions): Promise<GeneratedOutput> {
  const {
    schema,
    directives,
  } = options;

  const codegenOptions: Types.GenerateOptions = {
    filename: path.join(options.baseOutputDir, "DataStoreExtension.dart"),
    plugins: [
      {
        appSyncDartExtensionPlugin: {},
      },
    ],
    schema,
    documents: [],
    config: {
      directives,
      scalars: { ...DART_SCALAR_MAP },
    },
    pluginMap: {
      appSyncDartExtensionPlugin: {
        plugin,
        addToSchema,
      },
    },
  };
  const generatedCode = await codegen(codegenOptions);
  return {[codegenOptions.filename]: generatedCode};
}