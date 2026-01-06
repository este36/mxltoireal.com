import wasmUrl from 'musicxml-irealpro/wasm-module?url'
import {Song} from './components/app/Song.js'
import './components/app/BtnSquare.js';
import * as mxl2irp from 'musicxml-irealpro';
import { setLocalState, getLocalState } from './state.js';
import { notifyUser } from './notify.js';
import { NotifyLevel } from './components/app/NotifyCard.js';

export let App;
export let Templates;

export function updateDownloadFooter(fileListRect) {
	if (App.FilesList.childElementCount > 1) {
		const playlistNameHeight = App.FilesList.firstElementChild.getBoundingClientRect().height;
		const songCardHeight = App.FilesList.children[1].getBoundingClientRect().height;
		document.documentElement.style.setProperty('--song-card-height', songCardHeight + 'px');
		document.documentElement.style.setProperty('--playlistname-height', playlistNameHeight + 2 + 'px');
		if (!fileListRect) fileListRect = App.FilesList.getBoundingClientRect();
		App.DownloadFooter.style.width = (fileListRect.width + 4).toString() + 'px';
	}
}

let downloadFooterIsInit = false;
export function updateFilesList() {
	const n = App.FilesList.childElementCount;
	App.FilesCount.textContent = (n == 2 ? '1 file selected' : `${(n - 1).toString()} files selected`);
	if (!downloadFooterIsInit) {
		updateDownloadFooter();
		downloadFooterIsInit = true;
	}
	const minFilesList = parseInt(getComputedStyle(App.FilesList).getPropertyValue('--min-fileslist'));
	App.FilesList.classList.toggle('no-last-border-b', App.FilesList.childElementCount > minFilesList);
}

async function appendSong(file) {

	return new Promise((resolve, reject) => {
		if (!file.name.endsWith(".mxl")
			&& !file.name.endsWith(".musicxml")
			&& !file.name.endsWith(".xml"))
		{
			notifyUser(
				NotifyLevel.Error,
				`imported file "${file.name}" not supported. Valid files are *.mxl, *.musicxml, or *.xml`
			);
			reject(new Error("ERROR_BAD_FILE_EXT"));
			return;
		}
		const reader = new FileReader();
		reader.onerror = () => reject(reader.error);
		reader.onload = () => {
			const mxl2irp_result = mxl2irp.getIRealProSong(new Uint8Array(reader.result), file.name);
			if (mxl2irp_result.error_code != 0) {
				notifyUser(
					NotifyLevel.Error,
					`file "${file.name}" content is corrupt`
				);
				reject(new Error(mxl2irp.get_error_code_str(mxl2irp_result.error_code)));
				return;
			}
			if (document.body.dataset.isEmpty === 'true') {
				document.body.dataset.isEmpty = 'false';
			} 
			App.FilesList.appendChild(new Song(mxl2irp_result.item));
			resolve(0);
		};
		reader.readAsArrayBuffer(file);
	})
}

let dragCount = 0;
async function initDropZone() {
	document.body.addEventListener('dragenter', (e) => {
		e.preventDefault();
		if (dragCount == 0 && e.dataTransfer.items[0].kind === 'file')
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
	document.body.addEventListener('drop', async (e) => {
		e.preventDefault();
		dragCount = 0;
		App.DropZone.dataset.drag = 'off';
		for (const file of e.dataTransfer.files)
		{
			try {
				await appendSong(file);
			}
			catch (err) {
				console.log(err);
			}
		}
		updateFilesList();
	});
}

function initSongEditorModal() {
	const styleSelector = Templates.SongEditorModal.content.querySelector('#modal-song-style');
	let i = 1;
	while(true)
	{
		const style_str = mxl2irp.get_style_str(i);
		if (!style_str) break;
		const newOpt = document.createElement('option');
		newOpt.textContent = style_str;
		styleSelector.appendChild(newOpt);
		i++;
	}
}

function getPlaylistName() {
	let name = App.PlaylistName.value.trim();
	if (name.length == 0) name = 'mxltoireal.com';
	return name;
}

function getIrealProUrl(playlistName, songs) {
	const irp_playlist = mxl2irp.irp_playlist_create(playlistName);
	for (const song of songs) {
		mxl2irp.irp_playlist_append(irp_playlist, song.ptr);
	}
	const url_ptr = mxl2irp.irp_playlist_get_html(irp_playlist);
	if (!url_ptr) throw new Error('irp_playlist_get_html FAIL');
	const tmp = document.createElement('div');
	tmp.innerHTML = mxl2irp.Wasm.UTF8ToString(url_ptr);
	mxl2irp.free(url_ptr);
	return tmp.firstElementChild;
}

function DownloadBtn_onClick() {
	const playlist_name = getPlaylistName();
	const url = getIrealProUrl(playlist_name, App.FilesList.querySelectorAll('song-template'));
	const textContent = `<!DOCTYPE html>
<head>
	<title>${playlist_name}</title>
</head>
<body>
	<h1>${url.outerHTML}</h1>
	<script>console.log(document.querySelector('a').href.split('==='))</script>
</body>`;
	const blob = new Blob([textContent], {type: 'text/html'});
	const a = document.createElement('a');
	const a_url = URL.createObjectURL(blob);
	a.href = a_url;
	a.target = '_blank';
	a.download = playlist_name.replace(/ /g, '_') + '.html';
	a.click();
	URL.revokeObjectURL(a_url);
	setLocalState([]);
}

function OpenInIrealproBtn_onClick(event) {
	event.preventDefault();
	const a = getIrealProUrl(getPlaylistName(), App.FilesList.querySelectorAll('song-template'));
	window.location = a.href;
}

export function setupFalseSubmitBtns(scope) {
	const falseSubmitBtns = scope.querySelectorAll('.false-submit-btn');
	for (const btn of falseSubmitBtns) {
		btn.addEventListener('click', (event) => {
			event.preventDefault();
			const inputs = document.querySelectorAll(event.target.dataset.inputs);
			for (const input of inputs) {
				if (document.activeElement === input) {
					input.blur();
					return;
				}
			}
		});
	}
}

let FilesListStateIsInit = false;
async function initFilesListState() {
	const lastState = await getLocalState();
	if (!lastState.isValid()) {
		await setLocalState([]);
		FilesListStateIsInit = true;
		return;
	}
	mxl2irp.Wasm.HEAPU8.set(lastState.WasmHeap);
	for (const song_ptr of lastState.SongsPtrs) {
		App.FilesList.appendChild(new Song(song_ptr));
	}
	document.body.dataset.isEmpty = 'false';
	App.PlaylistName.value = lastState.PlaylistName;
	updateFilesList();
}

document.addEventListener('DOMContentLoaded', async () => {
	Templates = {
		Song: document.getElementById('song-template'),
		BtnSquare: document.getElementById('btn-square-template'),
		DownloadFooter: document.getElementById('download-footer-template'),
		SongEditorModal: document.getElementById('song-editor-modal-template'),
		NotifyCard: document.getElementById('notify-card-template'),
	};

	const downloadFooter = document.createElement('div');
	downloadFooter.appendChild(Templates.DownloadFooter.content.cloneNode(true));
	downloadFooter.classList.add(...Templates.DownloadFooter.classList);
	document.querySelector('#app').insertAdjacentElement('afterend', downloadFooter);
	document.body.dataset.isEmpty = true;

	App = {
		MainElement: document.querySelector('main'),
		DropZone: document.getElementById('drop-zone'),
		NotifyContainer: document.getElementById('notify-container'),
		FilesList: document.getElementById('files-list'),
		FilesCount: document.getElementById('files-count'),
		DownloadFooter: document.getElementById('download-footer'),
		DownloadBtn: document.getElementById('download-btn'),
		OpenInIrealproBtn: document.getElementById('open-in-irealpro-btn'),
		PlaylistName: document.getElementById('input-playlist-name'),
	};


	App.DownloadBtn.addEventListener('click', DownloadBtn_onClick);
	App.OpenInIrealproBtn.addEventListener('click', OpenInIrealproBtn_onClick);
	setupFalseSubmitBtns(document.body);

	window.App = App;
	window.mxl2irp = mxl2irp;
	await mxl2irp.initWasm(wasmUrl);
	initSongEditorModal();
	initDropZone();

	let inputFiles = document.querySelectorAll('.input-files');
	for (const inputFile of inputFiles) {
		inputFile.addEventListener('change', async (e) => {
			for (const file of e.target.files) {
				// const perf1 = performance.now()
				try {
					await appendSong(file);
				}
				catch (err) {
					console.log(err);
				}
				//  console.log('appendSong', performance.now() - perf1 + 'ms')
			}
			updateFilesList();
		});
	}

	const resizeObserver = new ResizeObserver((entries) => {
		for (let entry of entries) {
			updateDownloadFooter(entry.contentRect);
		}
	});
	resizeObserver.observe(App.FilesList);
	const updateState = () => {
		if (FilesListStateIsInit) {
			const songs = App.FilesList.querySelectorAll('song-template');
			setLocalState(songs, App.PlaylistName.value.trim());
		}
		FilesListStateIsInit = true;
	}
	const songsObserver = new MutationObserver(updateState);
	songsObserver.observe(App.FilesCount, { childList: true, characterData: true, subtree: true });
	App.PlaylistName.addEventListener('change', updateState)
	initFilesListState();
});
