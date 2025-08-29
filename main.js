import wasmUrl from 'musicxml-irealpro/wasm-module?url'
import * as mxl2irp from 'musicxml-irealpro';

(async () => {
  await mxl2irp.initWasm(wasmUrl);
}) ();
