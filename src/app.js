import './style.css'

import wasmUrl from 'musicxml-irealpro/wasm-module?url'
import {Song} from './components/Song.js'
import * as mxl2irp from 'musicxml-irealpro';

export let App;
export let Templates;

function onInputFileChange(event) {
	for (const file of event.target.files) {
		const reader = new FileReader();
		reader.onload = () => {
			const mxl2irp_result = mxl2irp.getIRealProSong(new Uint8Array(reader.result), file.name);
			if (mxl2irp_result.error_code != 0) {
				console.error(mxl2irp.get_error_code_str(mxl2irp_result.error_code));
				return;
			}
			App.FilesList.appendChild(new Song(mxl2irp_result.item));
			if (App.FilesList.childNodes.length > 0
				&& App.MainElement.dataset.isEmpty === 'true')
				App.MainElement.dataset.isEmpty = 'false';
		};
    	reader.readAsArrayBuffer(file);
	}
}

document.addEventListener('DOMContentLoaded', async () => {
	App = {
		MainElement: document.querySelector('main'),
		InputFile: document.getElementById('input-files'),
		InputFileLabel: document.querySelector('label[for=input-files]'),
		DropZone: document.getElementById('drop-zone'),
		FilesList: document.getElementById('files-list')
	};
	Templates = {
		Song: document.getElementById('song-template')
	};
	window.App = App;
	document.body.style.visibility = 'visible';
	await mxl2irp.initWasm(wasmUrl);
	App.InputFile.addEventListener('change', onInputFileChange);
});
