import {App, Templates} from '../app.js'
import * as mxl2irp from 'musicxml-irealpro'

const PropEnum = {
	Composer: "composer",
	Title: "title",
	Tempo: "tempo",
	Edit: "edit",
	Delete: "delete",
}

export class Song extends HTMLElement
{
	constructor(irpSongPtr)
	{
		super();
		this.irp_song = irpSongPtr;
	}

	el(dataId) {
		return this.querySelector('*[data-id=' + dataId + ']');
	}

	remove() {
		if (this.irp_song) {
			mxl2irp.free(this.irp_song);
			this.irp_song = 0;
		}
		super.remove();
	}

	connectedCallback() {
		this.appendChild(Templates.Song.content.cloneNode(true));
		this.classList = [...Templates.Song.classList];
		this.el(PropEnum.Composer).textContent = mxl2irp.irp_song_get_composer(this.irp_song);
		this.el(PropEnum.Title).textContent = mxl2irp.irp_song_get_title(this.irp_song);
		this.el(PropEnum.Tempo).textContent = mxl2irp.irp_song_get_tempo(this.irp_song) + ' bpm';
		this.el(PropEnum.Delete).addEventListener('click', (event) => {
			this.remove();
			if (App.FilesList.childNodes.length === 0)
				App.MainElement.dataset.isEmpty = 'true';
		});
		this.el(PropEnum.Edit).addEventListener('click', (event) => {
			console.log("TODO: open file-item options.");
		});
	}

	set composer(value) {
		mxl2irp.irp_song_set_composer(this.irp_song, value);
		this.el(PropEnum.Composer).textContent = mxl2irp.irp_song_get_composer(this.irp_song);
	}
	get composer() {
		return mxl2irp.irp_song_get_composer(this.irp_song);
	}
}

customElements.define("song-template", Song);
