import {App, Templates} from '../app.js'
import * as mxl2irp from 'musicxml-irealpro'

async function getFileContent(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export class FileItem extends HTMLElement
{
	constructor()
	{
		super();
		this.fileRef = null;
		this.irealProSong = 0;
	}
	
	connectedCallback() {
		this.appendChild(Templates.FileItem.content.cloneNode(true));
		this.querySelector('.file-item-delete').addEventListener('click', (event) => {
			if (this.irealProSong)
				mxl2irp.free(this.irealProSong);
			this.remove();
			if (App.FilesList.childNodes.length === 0)
				App.MainElement.dataset.isEmpty = 'true';
		});
		this.querySelector('.file-item-options').addEventListener('click', (event) => {
			console.log("TODO: open file-item options.");
		});
	}

	set size(val) {
		this.querySelector('.file-item-size').textContent = val;
		this._size = val;
	}
	get size() {return this._size}

	set name(val) {
		this.querySelector('.file-item-name').textContent = val;
		this._name = val;
	}
	get name() {return this._name}

	async parse(file = null) {
		const fileContent = new Uint8Array(await getFileContent(file));
		this.irealProSong = await mxl2irp.getIRealProSong(fileContent, file.name);
		this.size = fileContent.length;
		this.name = file.name;
		this.fileRef = file;
	}
}

customElements.define("file-item", FileItem);
