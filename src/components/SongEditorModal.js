import { Templates, setupFalseSubmitBtns } from "../app";
import { Playlist, iRealRenderer } from "ireal-renderer";
import * as mxl2irp from 'musicxml-irealpro';

export class SongEditorModal extends HTMLElement
{

    constructor(song)
    {
        super();
        this.song = song;
        this.modal = document.createElement('dialog');
        this.modal.append(Templates.SongEditorModal.content.cloneNode(true));
        this.modal.classList.add(...Templates.SongEditorModal.classList);
        this.modal.dataset.previewClosed = true;
        this.selectedStyle = mxl2irp.STYLE_DEFAULT;
        this.updatePreview();
    };

    renderPreview() {
    }

    updateSong() {
        this.song.title = this.inputs.title.value;
        this.song.composer = this.inputs.composer.value;
        if (this.inputs.tempo.value != mxl2irp.get_style_default_tempo(this.song.style))
            this.song.tempo = this.inputs.tempo.value;
        this.song.style = this.inputs.style.selectedIndex + 1;
    }

    btnOk_click(e) {
        e.preventDefault();
        if (!this.inputs.tempo.checkValidity()) return;
        this.updateSong();
        this.modal.close();
        this.song.render();
    }

    btnCancel_click(e) {
        e.preventDefault();
        this.modal.close();
    }

    async updatePreview() {
        const rawHtml = this.song.renderHtml();
        const irSong = (new Playlist(rawHtml)).songs[0];
        const options = {
            minor: "-",
            transpose: 0,
            useH: false,
            hilite: false
        };
        const container = this.modal.querySelector('#preview');
        container.innerHTML = '';
        const renderer = new iRealRenderer();
        renderer.parse(irSong);
        renderer.render(irSong, container, options);
    }

    connectedCallback() {
        this.appendChild(this.modal);
        this.inputs = {
            title: this.modal.querySelector('#modal-song-title'),
            composer: this.modal.querySelector('#modal-song-composer'),
            style: this.modal.querySelector('#modal-song-style'),
            tempo: this.modal.querySelector('#modal-song-tempo'),
        };
        for (const key in this.inputs) {
            this.inputs[key].addEventListener('change', () => this.updatePreview());
        }
        this.modal.addEventListener('close', () => this.remove());
        this.modal.querySelector('#modal-song-ok').addEventListener('click', (e) => this.btnOk_click(e));
        this.modal.querySelector('#modal-song-cancel').addEventListener('click', (e) => this.btnCancel_click(e));
        setupFalseSubmitBtns(this.modal);
        this.inputs.title.value = this.song.title;
        this.inputs.composer.value = this.song.composer;
        this.inputs.style.children[this.song.style - 1].setAttribute('selected', '');
        this.inputs.tempo.value = (this.song.tempo ?
            this.song.tempo : 
            mxl2irp.get_style_default_tempo(this.song.style));
        this.modal.showModal();
        if (document.activeElement) {
            document.activeElement.blur();
        }
        const previewBtn = this.modal.querySelector('#preview-btn');
        previewBtn.addEventListener('click', (event) => {
            event.preventDefault();
            let isopen = this.modal.dataset.previewClosed;
            this.modal.dataset.previewClosed = !(isopen === 'true');
        })
    }
}

customElements.define('song-editor-modal-template', SongEditorModal);