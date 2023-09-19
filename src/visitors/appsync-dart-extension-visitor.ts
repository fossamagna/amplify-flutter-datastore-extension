import {
  AppSyncModelVisitor,
  ParsedAppSyncModelConfig,
  RawAppSyncModelConfig,
  CodeGenModel,
  CodeGenField,
} from "@aws-amplify/appsync-modelgen-plugin/lib/visitors/appsync-visitor";
import { DartDeclarationBlock } from "@aws-amplify/appsync-modelgen-plugin/lib/languages/dart-declaration-block";
import { DART_SCALAR_MAP } from "@aws-amplify/appsync-modelgen-plugin/lib/scalars";
import {
  AMPLIFY_CORE_PREFIX,
  COLLECTION_PACKAGE,
  CUSTOM_LINTS_MESSAGE,
  FLUTTER_AMPLIFY_CORE_IMPORT,
  IGNORE_FOR_FILE,
  LOADER_CLASS_NAME,
} from "@aws-amplify/appsync-modelgen-plugin/lib/configs/dart-config";
import {
  indent,
  NormalizedScalarsMap,
} from "@graphql-codegen/visitor-plugin-common";
import type { GraphQLSchema } from "graphql";

export interface RawAppSyncDartExtensionConfig extends RawAppSyncModelConfig {}

export interface ParsedAppSyncDartExtensionConfig
  extends ParsedAppSyncModelConfig {}

export class AppSyncDartExtensionVisitor<
  TRawConfig extends
    RawAppSyncDartExtensionConfig = RawAppSyncDartExtensionConfig,
  TPluginConfig extends
    ParsedAppSyncDartExtensionConfig = ParsedAppSyncDartExtensionConfig,
> extends AppSyncModelVisitor<TRawConfig, TPluginConfig> {
  constructor(
    schema: GraphQLSchema,
    rawConfig: TRawConfig,
    additionalConfig: Partial<TPluginConfig>,
    defaultScalars: NormalizedScalarsMap = DART_SCALAR_MAP,
  ) {
    super(schema, rawConfig, additionalConfig, defaultScalars);
  }

  generate(): string {
    // TODO: Remove us, leaving in to be explicit on why this flag is here.
    const shouldUseModelNameFieldInHasManyAndBelongsTo = true;
    // This flag is going to be used to tight-trigger on JS implementations only.
    const shouldImputeKeyForUniDirectionalHasMany = false;
    this.processDirectives(
      shouldUseModelNameFieldInHasManyAndBelongsTo,
      shouldImputeKeyForUniDirectionalHasMany,
    );

    return this.generateModelExtensionClasses();
  }

  /**
   * Generate classes with model directives
   */
  protected generateModelExtensionClasses(): string {
    const result: string[] = [];
    //Custom lints warning
    result.push(CUSTOM_LINTS_MESSAGE);
    //Ignore for file
    result.push(IGNORE_FOR_FILE);
    //Imports
    const packageImports = this.generatePackageHeader();
    result.push(packageImports);

    //Extension
    Object.entries(this.getSelectedModels()).forEach(([name, model]) => {
      const extensionDeclaration = this.generateExtensionClass(model);
      result.push(extensionDeclaration);
    });
    return result.join("\n\n");
  }

  protected generateExtensionClass(model: CodeGenModel): string {
    const modelName = this.getModelName(model);
    const classDeclarationBlock = new DartDeclarationBlock();
    classDeclarationBlock
      .asKind("extension")
      .extensionOn("AmplifyDataStore")
      .withName(`${modelName}Extension`)
      .withComment(
        `This is an auto generated extension representing the ${modelName} type in your schema.`,
      );
    // get method
    this.generateGetModelMethod(model, classDeclarationBlock);
    this.generateGetModelMethod(model, classDeclarationBlock, true);
    return classDeclarationBlock.string;
  }

  protected generateGetModelMethod(
    model: CodeGenModel,
    classDeclarationBlock: DartDeclarationBlock,
    nullable = false,
  ): void {
    const identifierFields = this.getModelIdentifierFields(model);
    const args = identifierFields.map((field: CodeGenField) => ({
      name: field.name,
      type: this.getNativeType(field),
    }));
    const identifierArgs = args
      .map((arg) => `${arg.name}: ${arg.name}`)
      .join(", ");
    const modelName = this.getModelName(model);
    const where = this.config.respectPrimaryKeyAttributesOnConnectionField
      ? `${modelName}.MODEL_IDENTIFIER.eq(${modelName}ModelIdentifier(${identifierArgs})),`
      : `${modelName}.ID.eq(${identifierArgs}),`;

    classDeclarationBlock.addClassMethod(
      `get${modelName}${nullable ? "OrNull" : ""}`,
      `Future<${modelName}${nullable ? "?" : ""}>`,
      args,
      [
        "return query(",
        indent(`${modelName}.classType,`),
        indent(`where: ${where}`),
        ")",
        `.then((list) => list.${nullable ? "singleOrNull" : "single"});`,
      ].join("\n"),
      undefined,
    );
  }

  protected getModelIdentifierFields(model: CodeGenModel): CodeGenField[] {
    if (this.selectedTypeIsNonModel()) {
      return [];
    }
    if (!this.config.respectPrimaryKeyAttributesOnConnectionField) {
      return [model.fields.find((f) => f.name === "id")!];
    }
    const primaryKeyField = this.getModelPrimaryKeyField(model);
    const { sortKeyFields } = primaryKeyField.primaryKeyInfo!;
    return [primaryKeyField, ...sortKeyFields];
  }

  protected generatePackageHeader(): string {
    let usingCollection = false;
    Object.entries({
      ...this.getSelectedModels(),
      ...this.getSelectedNonModels(),
    }).forEach(([name, model]) => {
      model.fields.forEach((f) => {
        if (f.isList) {
          usingCollection = true;
        }
      });
    });
    const flutterDatastorePackage = FLUTTER_AMPLIFY_CORE_IMPORT;
    const packagesImports = [
      usingCollection ? COLLECTION_PACKAGE : "",
      `${LOADER_CLASS_NAME}.dart`,
    ]
      .filter((f) => f)
      .map((pckg) => `import '${pckg}';`);
    packagesImports.push(
      `import '${flutterDatastorePackage}.dart' as ${AMPLIFY_CORE_PREFIX};`,
    );
    packagesImports.push(
      `import 'package:amplify_datastore/amplify_datastore.dart';`,
    );
    return packagesImports.sort().join("\n") + "\n";
  }
}
