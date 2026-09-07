const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const defaultRoot = path.resolve(__dirname, '../..');

function stripExtension(name) {
  return name.replace(/\.(?:ts|tsx|js|cjs)$/, '');
}

function createTsLoader({ root = defaultRoot, globals = {}, requireOverrides = {} } = {}) {
  const modules = new Map();

  function load(name) {
    const moduleName = stripExtension(name.replace(/^@\//, ''));
    if (modules.has(moduleName)) return modules.get(moduleName);

    const filename = path.join(root, moduleName + '.ts');
    const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022
      }
    }).outputText;
    const exports = {};

    function localRequire(request) {
      if (Object.prototype.hasOwnProperty.call(requireOverrides, request)) {
        const override = requireOverrides[request];
        return typeof override === 'function'
          ? override({ request, from: moduleName, load })
          : override;
      }
      if (request.startsWith('@/')) return load(request.slice(2));
      if (request.startsWith('.')) {
        const relative = path.posix.normalize(path.posix.join(path.posix.dirname(moduleName), request));
        return load(relative);
      }
      return require(request);
    }

    vm.runInNewContext(compiled, {
      exports,
      require: localRequire,
      URL,
      URLSearchParams,
      ...globals
    }, { filename: moduleName + '.ts' });
    modules.set(moduleName, exports);
    return exports;
  }

  return load;
}

module.exports = { createTsLoader };
