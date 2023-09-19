import { parse } from "graphql";
import { generateExtensions, GenerateExtensionsOptions } from "./extension";

describe("extension", () => {
  it("should be generate extensions", async () => {
    const typeDefs = /* GraphQL */ `
      type Todo @model {
        id: ID!
        name: String!
        description: String
      }
    `;
    const schema = parse(typeDefs);
    const options: GenerateExtensionsOptions = {
      baseOutputDir: "lib/models",
      directives: "",
      schema,
    };
    const output = await generateExtensions(options);
    expect(output).toMatchSnapshot();
  });

  it("should be generate extensions with primaryKey and sortKey", async () => {
    const typeDefs = /* GraphQL */ `
      type Inventory @model {
        productID: ID! @primaryKey(sortKeyFields: ["warehouseID"])
        warehouseID: ID!
        InventoryAmount: Int!
      }
    `;
    const schema = parse(typeDefs);
    const options: GenerateExtensionsOptions = {
      baseOutputDir: "lib/models",
      directives: "",
      schema,
    };
    const output = await generateExtensions(options);
    expect(output).toMatchSnapshot();
  });

  it("should not be generate extensions with primaryKey and sortKey when respectPrimaryKeyAttributesOnConnectionField is false", async () => {
    const typeDefs = /* GraphQL */ `
      type Inventory @model {
        productID: ID! @primaryKey(sortKeyFields: ["warehouseID"])
        warehouseID: ID!
        InventoryAmount: Int!
      }
    `;
    const schema = parse(typeDefs);
    const options: GenerateExtensionsOptions = {
      baseOutputDir: "lib/models",
      directives: "",
      schema,
      respectPrimaryKeyAttributesOnConnectionField: false,
    };
    const output = await generateExtensions(options);
    expect(output).toMatchSnapshot();
  });
});
