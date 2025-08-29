import wasmUrl from 'musicxml-irealpro/wasm-module?url'
import * as mxl2irp from 'musicxml-irealpro';
import './style.css'

export const App = {
	Elements: {
		input_files: document.getElementById('input-files'),
		input_files_label: document.querySelector('label[for=input-files]'),
		drop_zone: document.getElementById('drop-zone')
	}
	Templates: {
		files_list: document.getElementById('files-list'),
		file_item: document.getElementById('file-item'),
	}
};

window.App = App;

(async () => {
  await mxl2irp.initWasm(wasmUrl);
  App.Elements.input_files_label.addEventListener('click')
}) ();
