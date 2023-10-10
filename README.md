<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

This project is amplify plugin to generate Flutter Extensions for DataStore operations.
This feature is automatically executed when run `amplify codegen models`.

[![NPM version][npm-image]][npm-url] [![codecov][codecov-image]][codecov-url]

<!-- GETTING STARTED -->

## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Prerequisites

First, install AWS Amplify CLI using npm (we assume you have pre-installed node.js).

```sh
npm install -g @aws-amplify/cli
```

### Installation

1. Install NPM packages
   ```sh
   npm install -g amplify-flutter-datastore-extension
   ```
2. Enable this plugin
   ```sh
   amplify plugin add $(npm root -g)/amplify-flutter-datastore-extension
   ```

<!-- USAGE EXAMPLES -->

## Usage

`amplify/backend/api/{api_name}/schema.graphql` containing the following:

```graphql
type Todo @model {
  id: ID!
  name: String!
  description: String
}
```

Run the following command:

```bash
amplify codegen models
```

The plugin outputs `DataStoreExtension.dart` with the following contents:

```dart
import 'ModelProvider.dart';
import 'package:amplify_core/amplify_core.dart' as amplify_core;

/** This is an auto generated extension representing the Todo type in your schema. */
extension TodoExtension on amplify_core.DataStoreCategory {
  Future<Todo> getTodo(String id) {
    return query(
      Todo.classType,
      where: Todo.MODEL_IDENTIFIER.eq(TodoModelIdentifier(id: id)),
    )
    .then((list) => list.single);
  }

  Future<Todo?> getTodoOrNull(String id) {
    return query(
      Todo.classType,
      where: Todo.MODEL_IDENTIFIER.eq(TodoModelIdentifier(id: id)),
    )
    .then((list) => list.singleOrNull);
  }
}
```

You can call it as follows:

```dart
final id = "080f33bf-0362-4c7f-9dfa-de64fc231dca";
final todo = await Amplify.DataStore.getTodo(id);
```

<!-- ROADMAP -->

## Roadmap

See the [open issues](https://github.com/fossamagna/amplify-flutter-datastore-extension/issues) for a list of proposed features (and known issues).

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->

## License

Distributed under the Apache-2.0 License. See `LICENSE` for more information.

<!-- CONTACT -->

## Contact

Masahiko MURAKAMI - [@fossamagna](https://twitter.com/fossamagna)

Project Link: [https://github.com/fossamagna/amplify-flutter-datastore-extension](https://github.com/fossamagna/amplify-flutter-datastore-extension)

[npm-image]: https://badge.fury.io/js/amplify-flutter-datastore-extension.svg
[npm-url]: https://npmjs.org/package/amplify-flutter-datastore-extension
[codecov-image]: https://codecov.io/gh/fossamagna/amplify-flutter-datastore-extension/graph/badge.svg?token=J4S4TO6zXB
[codecov-url]: https://codecov.io/gh/fossamagna/amplify-flutter-datastore-extension
