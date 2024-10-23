# Issues

## 01

- `ts-node 10` is having a hard time loading `.ts` files due to compatibilities with `Node 20+`, throwing an `ERR_UNKNOWN_FILE_EXTENSION` error with the current setup. The fix I found is to run the script for the `wiki-data` file using `node --loader ts-node/esm {file}` (See [GitHub thread](https://github.com/TypeStrong/ts-node/issues/1997#issuecomment-1518740123)).

  - Also added ability to import other .ts files in index.ts the file as seen [in the thread](https://github.com/TypeStrong/ts-node/issues/1997#issuecomment-2182604227).
