import './style.css'
import './components/css/FileItem.css'

import wasmUrl from 'musicxml-irealpro/wasm-module?url'
import {FileItem} from './components/FileItem.js'
import * as mxl2irp from 'musicxml-irealpro';

export let App;
export let Templates;

document.addEventListener('DOMContentLoaded', async () => {
	App = {
		MainElement: document.querySelector('main'),
		InputFile: document.getElementById('input-files'),
		InputFileLabel: document.querySelector('label[for=input-files]'),
		DropZone: document.getElementById('drop-zone'),
		FilesList: document.getElementById('files-list')
	};
	Templates = {
		FileItem: document.getElementById('file-item')
	};
	window.App = App;
	document.body.style.visibility = 'visible';
	await mxl2irp.initWasm(wasmUrl);
	App.InputFile.addEventListener('change', async (event) => {
		for (const file of event.target.files) {
			App.FilesList.appendChild(new FileItem());
			const new_entry = App.FilesList.lastChild;
			try {
				new_entry.parse(file);
			} catch (err) {
				console.error(err.toString());
				new_entry.remove();
			}
			if (App.FilesList.childNodes.length > 0
				&& App.MainElement.dataset.isEmpty === 'true')
				App.MainElement.dataset.isEmpty = 'false';
		}
	});
});
