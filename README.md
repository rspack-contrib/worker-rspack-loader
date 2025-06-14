# worker-rspack-loader

Web Worker loader for Rspack.

> [!NOTE]
> Usually you only need to use this loader if you need inline Web Workers, otherwise you should refer to [Rspack's Web Workers guide](https://rspack.rs/guide/features/web-workers).

[![npm][npm]][npm-url]
[![node][node]][node-url]
[![size][size]][size-url]

## Notice

This loader is forked from [webpack-contrib/worker-loader](https://github.com/webpack-contrib/worker-loader) since it has been archived.

The loader is basically the same as [webpack-contrib/worker-loader](https://github.com/webpack-contrib/worker-loader). And this loader can be used with both Rspack and Webpack 5.

Change list:

- Compatible with Rspack: https://github.com/rspack-contrib/worker-rspack-loader/commit/7b90e834f67177badc313a52f701422256330d1e

## Getting Started

To begin, you'll need to install `worker-rspack-loader`:

```console
$ npm install worker-rspack-loader --save-dev
```

### Inlined

**App.js**

```js
import Worker from "worker-rspack-loader!./Worker.js";
```

### Config

**rspack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.worker\.js$/,
        use: { loader: "worker-rspack-loader" },
      },
    ],
  },
};
```

**App.js**

```js
import Worker from "./file.worker.js";

const worker = new Worker();

worker.postMessage({ a: 1 });
worker.onmessage = function (event) {};

worker.addEventListener("message", function (event) {});
```

And run Rspack via your preferred method.

## Options

|                 Name                  |            Type             |             Default             | Description                                                                       |
| :-----------------------------------: | :-------------------------: | :-----------------------------: | :-------------------------------------------------------------------------------- |
|        **[`worker`](#worker)**        |     `{String\|Object}`      |            `Worker`             | Allows to set web worker constructor name and options                             |
|    **[`publicPath`](#publicpath)**    |    `{String\|Function}`     |  based on `output.publicPath`   | specifies the public URL address of the output files when referenced in a browser |
|      **[`filename`](#filename)**      |    `{String\|Function}`     |   based on `output.filename`    | The filename of entry chunks for web workers                                      |
| **[`chunkFilename`](#chunkfilename)** |         `{String}`          | based on `output.chunkFilename` | The filename of non-entry chunks for web workers                                  |
|        **[`inline`](#inline)**        | `'no-fallback'\|'fallback'` |           `undefined`           | Allow to inline the worker as a `BLOB`                                            |
|      **[`esModule`](#esmodule)**      |         `{Boolean}`         |             `true`              | Use ES modules syntax                                                             |

### `worker`

Type: `String|Object`
Default: `Worker`

Set the worker type.

#### `String`

Allows to set web worker constructor name.

**rspack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.worker\.(c|m)?js$/i,
        loader: "worker-rspack-loader",
        options: {
          worker: "SharedWorker",
        },
      },
    ],
  },
};
```

#### `Object`

Allow to set web worker constructor name and options.

**rspack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.worker\.(c|m)?js$/i,
        loader: "worker-rspack-loader",
        options: {
          worker: {
            type: "SharedWorker",
            options: {
              type: "classic",
              credentials: "omit",
              name: "my-custom-worker-name",
            },
          },
        },
      },
    ],
  },
};
```

### `publicPath`

Type: `String|Function`
Default: based on `output.publicPath`

The `publicPath` specifies the public URL address of the output files when referenced in a browser.

If not specified, the same public path used for other Rspack assets is used.

#### `String`

**rspack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.worker\.(c|m)?js$/i,
        loader: "worker-rspack-loader",
        options: {
          publicPath: "/scripts/workers/",
        },
      },
    ],
  },
};
```

#### `Function`

**rspack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.worker\.(c|m)?js$/i,
        loader: "worker-rspack-loader",
        options: {
          publicPath: (pathData, assetInfo) => {
            return `/scripts/${pathData.hash}/workers/`;
          },
        },
      },
    ],
  },
};
```

### `filename`

Type: `String|Function`
Default: based on `output.filename`, adding `worker` suffix, for example - `output.filename: '[name].js'` value of this option will be `[name].worker.js`

The filename of entry chunks for web workers.

#### `String`

**rspack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.worker\.(c|m)?js$/i,
        loader: "worker-rspack-loader",
        options: {
          filename: "[name].[contenthash].worker.js",
        },
      },
    ],
  },
};
```

#### `Function`

**rspack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.worker\.(c|m)?js$/i,
        loader: "worker-rspack-loader",
        options: {
          filename: (pathData) => {
            if (
              /\.worker\.(c|m)?js$/i.test(pathData.chunk.entryModule.resource)
            ) {
              return "[name].custom.worker.js";
            }

            return "[name].js";
          },
        },
      },
    ],
  },
};
```

### `chunkFilename`

Type: `String`
Default: based on `output.chunkFilename`, adding `worker` suffix, for example - `output.chunkFilename: '[id].js'` value of this option will be `[id].worker.js`

The filename of non-entry chunks for web workers.

**rspack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.worker\.(c|m)?js$/i,
        loader: "worker-rspack-loader",
        options: {
          chunkFilename: "[id].[contenthash].worker.js",
        },
      },
    ],
  },
};
```

### `inline`

Type: `'fallback' | 'no-fallback'`
Default: `undefined`

Allow to inline the worker as a `BLOB`.

Inline mode with the `fallback` value will create file for browsers without support web workers, to disable this behavior just use `no-fallback` value.

**rspack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.worker\.(c|m)?js$/i,
        loader: "worker-rspack-loader",
        options: {
          inline: "fallback",
        },
      },
    ],
  },
};
```

### `esModule`

Type: `Boolean`
Default: `true`

By default, `worker-rspack-loader` generates JS modules that use the ES modules syntax.

You can enable a CommonJS modules syntax using:

**rspack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.worker\.(c|m)?js$/i,
        loader: "worker-rspack-loader",
        options: {
          esModule: false,
        },
      },
    ],
  },
};
```

## Examples

### Basic

The worker file can import dependencies just like any other file:

**index.js**

```js
import Worker from "./my.worker.js";

var worker = new Worker();

var result;

worker.onmessage = function (event) {
  if (!result) {
    result = document.createElement("div");
    result.setAttribute("id", "result");

    document.body.append(result);
  }

  result.innerText = JSON.stringify(event.data);
};

const button = document.getElementById("button");

button.addEventListener("click", function () {
  worker.postMessage({ postMessage: true });
});
```

**my.worker.js**

```js
onmessage = function (event) {
  var workerResult = event.data;

  workerResult.onmessage = true;

  postMessage(workerResult);
};
```

**rspack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.worker\.(c|m)?js$/i,
        loader: "worker-rspack-loader",
        options: {
          esModule: false,
        },
      },
    ],
  },
};
```

### Integrating with ES6+ features

You can even use ES6+ features if you have the [`babel-loader`](https://github.com/babel/babel-loader) configured.

**index.js**

```js
import Worker from "./my.worker.js";

const worker = new Worker();

let result;

worker.onmessage = (event) => {
  if (!result) {
    result = document.createElement("div");
    result.setAttribute("id", "result");

    document.body.append(result);
  }

  result.innerText = JSON.stringify(event.data);
};

const button = document.getElementById("button");

button.addEventListener("click", () => {
  worker.postMessage({ postMessage: true });
});
```

**my.worker.js**

```js
onmessage = function (event) {
  const workerResult = event.data;

  workerResult.onmessage = true;

  postMessage(workerResult);
};
```

**rspack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.worker\.(c|m)?js$/i,
        use: [
          {
            loader: "worker-rspack-loader",
          },
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        ],
      },
    ],
  },
};
```

### Integrating with TypeScript

To integrate with TypeScript, you will need to define a custom module for the exports of your worker.

#### Loading with `worker-rspack-loader!`

**typings/worker-rspack-loader.d.ts**

```typescript
declare module "worker-rspack-loader!*" {
  // You need to change `Worker`, if you specified a different value for the `workerType` option
  class WebpackWorker extends Worker {
    constructor();
  }

  // Uncomment this if you set the `esModule` option to `false`
  // export = WebpackWorker;
  export default WebpackWorker;
}
```

**my.worker.ts**

```typescript
const ctx: Worker = self as any;

// Post data to parent thread
ctx.postMessage({ foo: "foo" });

// Respond to message from parent thread
ctx.addEventListener("message", (event) => console.log(event));
```

**index.ts**

```typescript
import Worker from "worker-rspack-loader!./Worker";

const worker = new Worker();

worker.postMessage({ a: 1 });
worker.onmessage = (event) => {};

worker.addEventListener("message", (event) => {});
```

#### Loading without `worker-rspack-loader!`

Alternatively, you can omit the `worker-rspack-loader!` prefix passed to `import` statement by using the following notation.
This is useful for executing the code using a non-Rspack runtime environment
(such as Jest with [`workerloader-jest-transformer`](https://github.com/astagi/workerloader-jest-transformer)).

**typings/worker-rspack-loader.d.ts**

```typescript
declare module "*.worker.ts" {
  // You need to change `Worker`, if you specified a different value for the `workerType` option
  class WebpackWorker extends Worker {
    constructor();
  }

  // Uncomment this if you set the `esModule` option to `false`
  // export = WebpackWorker;
  export default WebpackWorker;
}
```

**my.worker.ts**

```typescript
const ctx: Worker = self as any;

// Post data to parent thread
ctx.postMessage({ foo: "foo" });

// Respond to message from parent thread
ctx.addEventListener("message", (event) => console.log(event));
```

**index.ts**

```typescript
import MyWorker from "./my.worker.ts";

const worker = new MyWorker();

worker.postMessage({ a: 1 });
worker.onmessage = (event) => {};

worker.addEventListener("message", (event) => {});
```

**rspack.config.js**

```js
module.exports = {
  module: {
    rules: [
      // Place this *before* the `ts-loader`.
      {
        test: /\.worker\.ts$/,
        loader: "worker-rspack-loader",
      },
      {
        test: /\.ts$/,
        loader: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
};
```

### Cross-Origin Policy

[`WebWorkers`](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) are restricted by a [same-origin policy](https://en.wikipedia.org/wiki/Same-origin_policy), so if your Rspack assets are not being served from the same origin as your application, their download may be blocked by your browser.
This scenario can commonly occur if you are hosting your assets under a CDN domain.
Even downloads from the `rspack-dev-server` could be blocked.

There are two workarounds:

Firstly, you can inline the worker as a blob instead of downloading it as an external script via the [`inline`](#inline) parameter

**App.js**

```js
import Worker from "./file.worker.js";
```

**rspack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        loader: "worker-rspack-loader",
        options: { inline: "fallback" },
      },
    ],
  },
};
```

Secondly, you may override the base download URL for your worker script via the [`publicPath`](#publicpath) option

**App.js**

```js
// This will cause the worker to be downloaded from `/workers/file.worker.js`
import Worker from "./file.worker.js";
```

**rspack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        loader: "worker-rspack-loader",
        options: { publicPath: "/workers/" },
      },
    ],
  },
};
```

## Contributing

Please take a moment to read our contributing guidelines if you haven't yet done so.

[CONTRIBUTING](./.github/CONTRIBUTING.md)

## License

[MIT](./LICENSE)

[npm]: https://img.shields.io/npm/v/worker-rspack-loader.svg
[npm-url]: https://npmjs.com/package/worker-rspack-loader
[node]: https://img.shields.io/node/v/worker-rspack-loader.svg
[node-url]: https://nodejs.org
[deps]: https://david-dm.org/rspack-contrib/worker-rspack-loader.svg
[tests]: https://github.com/rspack-contrib/worker-rspack-loader/workflows/worker-rspack-loader/badge.svg
[tests-url]: https://github.com/rspack-contrib/worker-rspack-loader/actions
[cover]: https://codecov.io/gh/rspack-contrib/worker-rspack-loader/branch/master/graph/badge.svg
[cover-url]: https://codecov.io/gh/rspack-contrib/worker-rspack-loader
[size]: https://packagephobia.now.sh/badge?p=worker-rspack-loader
[size-url]: https://packagephobia.now.sh/result?p=worker-rspack-loader
