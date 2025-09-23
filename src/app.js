import './style.css'

import wasmUrl from 'musicxml-irealpro/wasm-module?url'
import {Song} from './components/Song.js'
import './components/BtnSquare.js';
import * as mxl2irp from 'musicxml-irealpro';

export let App;
export let Templates;

export function updateFilesCount() {
    const n = App.FilesList.childElementCount;
    App.FilesCount.textContent = (n == 1 ? '1 file selected' : `${n.toString()} files selected`);
}

export function updateDownloadFooter(fileListRect) {
    if (App.FilesList.childElementCount != 0) {
        if (!fileListRect) fileListRect = App.FilesList.getBoundingClientRect();
        const firstChildHeight = App.FilesList.firstElementChild.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--song-card-height', firstChildHeight + 'px');
        App.DownloadFooter.style.width = (fileListRect.width + 2).toString() + 'px';
        // console.log(App.DownloadFooter.style.width);
        // console.log(fileListRect.width);
    }
}

function appendSong(file) {
	const reader = new FileReader();
	reader.onload = () => {
		const mxl2irp_result = mxl2irp.getIRealProSong(new Uint8Array(reader.result), file.name);
		if (mxl2irp_result.error_code != 0) {
			console.error(mxl2irp.get_error_code_str(mxl2irp_result.error_code));
			return;
		}
		if (document.body.dataset.isEmpty === 'true') {
			document.body.dataset.isEmpty = 'false';
		} else {
			// App.FilesList.appendChild(Templates.Divider.content.cloneNode(true));
		}
		App.FilesList.appendChild(new Song(mxl2irp_result.item));
        updateFilesCount();
        updateDownloadFooter();
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
		DropZone: document.getElementById('drop-zone'),
		FilesList: document.getElementById('files-list'),
		FilesCount: document.getElementById('files-count'),
        DownloadFooter: document.getElementById('download-footer'),
	};
	Templates = {
		Song: document.getElementById('song-template'),
		BtnSquare: document.getElementById('btn-square-template'),
	};
	window.App = App;
	await mxl2irp.initWasm(wasmUrl);
	initDropZone();
    let inputFiles = document.querySelectorAll('.input-files');
    for (const inputFile of inputFiles) {
        inputFile.addEventListener('change', (e) => {
            for (const file of e.target.files) {
                appendSong(file);
            }
        });
    }
    const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
            updateDownloadFooter(entry.contentRect);
        }
    });
    resizeObserver.observe(App.FilesList);
});
