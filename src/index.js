import path from "path";

import { getOptions } from "loader-utils";
import { validate } from "schema-utils";

import schema from "./options.json";
import supportWebpack5 from "./supportWebpack5";
import supportWebpack4 from "./supportWebpack4";
import {
  getDefaultFilename,
  getDefaultChunkFilename,
  getExternalsType,
} from "./utils";

function isWebpack5() {
  try {
    // eslint-disable-next-line global-require, import/no-unresolved
    return require("webpack/package.json").version.startsWith("5.");
  } catch (_err) {
    // Treat rspack as webpack 5
    return true;
  }
}

// determine the version of webpack peer dependency
const useWebpack5 = isWebpack5();

export default function loader() {}

export function pitch(request) {
  this.cacheable(false);

  const options = getOptions(this);

  validate(schema, options, {
    name: "Worker Loader",
    baseDataPath: "options",
  });

  let NodeTargetPlugin;
  let SingleEntryPlugin;
  let WebWorkerTemplatePlugin;
  let ExternalsPlugin;
  let FetchCompileWasmPlugin;
  let FetchCompileAsyncWasmPlugin;

  if (useWebpack5) {
    const { webpack } = this._compiler;
    NodeTargetPlugin = webpack.node.NodeTargetPlugin;
    SingleEntryPlugin = webpack.EntryPlugin;
    WebWorkerTemplatePlugin = webpack.webworker.WebWorkerTemplatePlugin;
    ExternalsPlugin = webpack.ExternalsPlugin;
    FetchCompileWasmPlugin = webpack.web.FetchCompileWasmPlugin;
    FetchCompileAsyncWasmPlugin = webpack.web.FetchCompileAsyncWasmPlugin;
  } else {
    // eslint-disable-next-line global-require, import/no-unresolved, import/extensions
    NodeTargetPlugin = require("webpack/lib/node/NodeTargetPlugin");
    // eslint-disable-next-line global-require, import/no-unresolved, import/extensions
    SingleEntryPlugin = require("webpack/lib/SingleEntryPlugin");
    // eslint-disable-next-line global-require, import/no-unresolved, import/extensions
    WebWorkerTemplatePlugin = require("webpack/lib/webworker/WebWorkerTemplatePlugin");
    // eslint-disable-next-line global-require, import/no-unresolved, import/extensions
    ExternalsPlugin = require("webpack/lib/ExternalsPlugin");
    // eslint-disable-next-line global-require, import/no-unresolved, import/extensions
    FetchCompileWasmPlugin = require("webpack/lib/web/FetchCompileWasmTemplatePlugin");
  }

  const workerContext = {};
  const compilerOptions = this._compiler.options || {};
  const filename = options.filename
    ? options.filename
    : getDefaultFilename(compilerOptions.output.filename);
  const chunkFilename = options.chunkFilename
    ? options.chunkFilename
    : getDefaultChunkFilename(compilerOptions.output.chunkFilename);
  const publicPath = options.publicPath
    ? options.publicPath
    : compilerOptions.output.publicPath;

  workerContext.options = {
    filename,
    chunkFilename,
    publicPath,
    globalObject: "self",
  };

  workerContext.compiler = this._compilation.createChildCompiler(
    `worker-loader ${request}`,
    workerContext.options
  );

  new WebWorkerTemplatePlugin().apply(workerContext.compiler);

  if (this.target !== "webworker" && this.target !== "web") {
    new NodeTargetPlugin().apply(workerContext.compiler);
  }

  if (FetchCompileWasmPlugin) {
    new FetchCompileWasmPlugin({
      mangleImports: compilerOptions.optimization.mangleWasmImports,
    }).apply(workerContext.compiler);
  }

  if (FetchCompileAsyncWasmPlugin) {
    new FetchCompileAsyncWasmPlugin().apply(workerContext.compiler);
  }

  if (compilerOptions.externals) {
    new ExternalsPlugin(
      getExternalsType(compilerOptions),
      compilerOptions.externals
    ).apply(workerContext.compiler);
  }

  new SingleEntryPlugin(
    this.context,
    `!!${request}`,
    path.parse(this.resourcePath).name
  ).apply(workerContext.compiler);

  workerContext.request = request;

  const cb = this.async();

  if (
    workerContext.compiler.cache &&
    typeof workerContext.compiler.cache.get === "function"
  ) {
    supportWebpack5(this, workerContext, options, cb);
  } else {
    supportWebpack4(this, workerContext, options, cb);
  }
}
