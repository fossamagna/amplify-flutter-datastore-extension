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
      directives: '',
      schema,
    };
    const output = await generateExtensions(options);
    expect(output).toMatchSnapshot();
  });
});