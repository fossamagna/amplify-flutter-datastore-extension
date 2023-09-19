import path from "node:path";
import type { DocumentNode } from "graphql";
import { codegen } from "@graphql-codegen/core";
import type { Types } from "@graphql-codegen/plugin-helpers";
import { DART_SCALAR_MAP } from "@aws-amplify/appsync-modelgen-plugin/lib/scalars";
import { plugin, addToSchema } from "./plugin";

export type GenerateExtensionsOptions = {
  schema: DocumentNode;
  directives: string;
  baseOutputDir: string;
  // feature flags
  generateIndexRules?: boolean;
  emitAuthProvider?: boolean;
  useExperimentalPipelinedTranformer?: boolean;
  transformerVersion?: number;
  respectPrimaryKeyAttributesOnConnectionField?: boolean;
  generateModelsForLazyLoadAndCustomSelectionSet?: boolean;
  addTimestampFields?: boolean;
  handleListNullabilityTransparently?: boolean;
};

export type GeneratedOutput = {
  [filepath: string]: string;
};

export async function generateExtensions(
  options: GenerateExtensionsOptions,
): Promise<GeneratedOutput> {
  const {
    schema,
    directives,
    // feature flags
    generateIndexRules = true,
    emitAuthProvider = true,
    useExperimentalPipelinedTranformer = true,
    transformerVersion = 2,
    respectPrimaryKeyAttributesOnConnectionField = true,
    generateModelsForLazyLoadAndCustomSelectionSet = true,
    addTimestampFields = true,
    handleListNullabilityTransparently = true,
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
      target: "dart",
      isTimestampFieldsAdded: addTimestampFields,
      emitAuthProvider,
      generateIndexRules,
      handleListNullabilityTransparently,
      usePipelinedTransformer: useExperimentalPipelinedTranformer,
      transformerVersion,
      respectPrimaryKeyAttributesOnConnectionField,
      generateModelsForLazyLoadAndCustomSelectionSet,
    },
    pluginMap: {
      appSyncDartExtensionPlugin: {
        plugin,
        addToSchema,
      },
    },
  };
  const generatedCode = await codegen(codegenOptions);
  return { [codegenOptions.filename]: generatedCode };
}
