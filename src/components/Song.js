import {App, Templates, updateFilesCount} from '../app.js'
import * as mxl2irp from 'musicxml-irealpro'

const PropEnum = {
	Composer: "composer",
	Title: "title",
	Style: "style",
	Tempo: "tempo",
	Key: "key",
	Edit: "edit",
	Delete: "delete",
}

export class Song extends HTMLElement
{
	constructor(irpSongPtr)
	{
		super();
		this.ptr = irpSongPtr;
	}

	el(dataId) {
		return this.querySelector('*[data-id=' + dataId + ']');
	}

	connectedCallback() {
		this.appendChild(Templates.Song.content.cloneNode(true));
		this.classList.add(...Templates.Song.classList);
		this.render();
		this.el(PropEnum.Delete).addEventListener('click', () => {
			this.remove();
			if (App.FilesList.childElementCount === 0)
				document.body.dataset.isEmpty = 'true';
            updateFilesCount();
		});
		this.el(PropEnum.Edit).addEventListener('click', (event) => {
			console.log("TODO: open file-item options.");
		});
	}

	disconnectedCallback() {
		if (this.ptr) {
			mxl2irp.free(this.ptr);
			this.ptr = 0;
		}
  	}

	render() {
		this.el(PropEnum.Composer).textContent = (this.composer ? this.composer :'Unknown Composer');
		this.el(PropEnum.Title).textContent = (this.title ? this.title : 'Song Title');
		const style = mxl2irp.get_style_str(this.style);
		this.el(PropEnum.Style).textContent = (style ? style : 'Jazz-Even 8ths');
		this.el(PropEnum.Tempo).textContent = (this.tempo ? this.tempo.toString() : '120') + ' bpm';
		const key = mxl2irp.get_note_str(this.key);
		this.el(PropEnum.Key).textContent = (key ? key : 'C');
	}

	get composer() {
		return mxl2irp.irp_song_get_composer(this.ptr);
	}
	get title() {
		return mxl2irp.irp_song_get_title(this.ptr);
	}
	get style() {
		return mxl2irp.irp_song_get_style(this.ptr);
	}
	get tempo() {
		return mxl2irp.irp_song_get_tempo(this.ptr);
	}
	get key() {
		return mxl2irp.irp_song_get_key(this.ptr);
	}
	set composer(value) {
		mxl2irp.irp_song_set_composer(this.ptr, value);
	}
	set title(value) {
		mxl2irp.irp_song_set_title(this.ptr, value);
	}
	set style(value) {
		mxl2irp.irp_song_set_style(this.ptr, value);
	}
	set tempo(value) {
		mxl2irp.irp_song_set_tempo(this.ptr, value);
	}
}

customElements.define("song-template", Song);
