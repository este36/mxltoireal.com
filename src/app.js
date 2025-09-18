import './style.css'

import wasmUrl from 'musicxml-irealpro/wasm-module?url'
import {Song} from './components/Song.js'
import './components/BtnSquare.js';
import * as mxl2irp from 'musicxml-irealpro';

export let App;
export let Templates;

function appendSong(file) {
	const reader = new FileReader();
	reader.onload = () => {
		const mxl2irp_result = mxl2irp.getIRealProSong(new Uint8Array(reader.result), file.name);
		if (mxl2irp_result.error_code != 0) {
			console.error(mxl2irp.get_error_code_str(mxl2irp_result.error_code));
			return;
		}
		if (App.MainElement.dataset.isEmpty === 'true') {
			App.MainElement.dataset.isEmpty = 'false';
		} else {
			// App.FilesList.appendChild(Templates.Divider.content.cloneNode(true));
		}
		App.FilesList.appendChild(new Song(mxl2irp_result.item));
	};
    reader.readAsArrayBuffer(file);
}


let dragCount = 0;
function initDropZone() {
	document.body.addEventListener('dragenter', (e) => {
		e.preventDefault();
		if (dragCount == 0)
			App.DropZone.dataset.drag = 'on';
		dragCount++;
	});
	document.body.addEventListener('dragleave', (e) => {
		e.preventDefault();
		dragCount--;
		if (dragCount == 0)
			App.DropZone.dataset.drag = 'off';
	});
	document.body.addEventListener('dragover', (e) => e.preventDefault());
	document.body.addEventListener('drop', (e) => {
		e.preventDefault();
		dragCount = 0;
		App.DropZone.dataset.drag = 'off';
		for (const file of e.dataTransfer.files)
			appendSong(file);
	});
}

document.addEventListener('DOMContentLoaded', async () => {
	App = {
		MainElement: document.querySelector('main'),
		InputFile: document.getElementById('input-files'),
		InputFileLabel: document.querySelector('label[for=input-files]'),
		DropZone: document.getElementById('drop-zone'),
		FilesList: document.getElementById('files-list'),
	};
	Templates = {
		Song: document.getElementById('song-template'),
		BtnSquare: document.getElementById('btn-square-template'),
		Divider: document.getElementById('divider-template'),
	};
	window.App = App;
	document.body.style.visibility = 'visible';
	await mxl2irp.initWasm(wasmUrl);
	initDropZone();
	App.InputFile.onchange = (e) => {
		for (const file of e.target.files) appendSong(file);
	};
});
