# TS Config

This is an example project that defines how to setup a TS project to export both CS and ESM type modules along with the corresponding TS.


Start initialize a new npm project as follows replacing '<ts-module>' with your module name.

```shell
pnpm init <name>
pnpm add -D @wattry/tsconfig
pnpm wattry-tsconfig init
```

This will initialize a new TS project that will export the source code as esm and cjs, as well as any typings.

Create a src directory and start building the module making sure to add an index.ts that should either export all your public functions or the main module that will be run.

When you're finished you can simply run:

```shell
pnpm build

pnpm publish
```

If your access token is configured correctly your module and it's typings will be published. If this code is not a public module then you can just execute the code right from the dist folder.

# Contributing

## Install
```shell
pnpm install -g .
```

## Build
This will output a dist directory that will contain a cjs, mjs and types directories respectively.
In the importing project you'll need to specify the type property in the package.json. Either "commonjs" or "module".
When you install this module the project will reference the correct source based on this flag.

This projects uses tsup in order to correctly adjust the import paths for esm to use .mjs. Remember that in cjs projects
using NodeJS v20+ you can import mjs modules in cjs code using the dynamic import. However, this import is async so you cannot do it at the top of your projects.

esm-js.mjs

```mjs
export myFunction(abc, zyx) {
  console.log('Hello World!', abc, zyx);
}
```

common-js.cjs

```cjs
export async function test(abc, zyx) {
  const esModule = await import('esm-js.mjs');

  const result = esModule.myFunction(abc, zyx);
}

```

The same is true for esm projects.

esm-cjs.mjs

```mjs
async function test() {
  const cjsModule = await import('common-js.cjs');

  const result = cjsModule.test(abc, zyx);
}
```

With this in mind you can build this project.

```shell
pnpm build
```

## Run

### TS
This uses ts-node to run the TS on the fly.

```shell
pnpm start
```

### CJS
This will use node to execute the dist/cjs/index.js

```shell
pnpm start:cjs
```

### ESM
This will use node to execute the dist/esm/index.mjs

```shell
pnpm start:cjs
```
