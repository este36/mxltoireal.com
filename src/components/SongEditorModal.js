import { Templates, setupFalseSubmitBtns } from "../app";

export class SongEditorModal extends HTMLElement
{
    constructor(song) {
        super();
        this.song = song;
        this.modal = document.createElement('dialog');
        this.modal.append(Templates.SongEditorModal.content.cloneNode(true));
        this.modal.classList.add(...Templates.SongEditorModal.classList);
    };

    updateSong() {
        this.song.title = this.inputs.title.value;
        this.song.composer = this.inputs.composer.value;
        this.song.style = this.inputs.style.value;
        this.song.tempo = this.inputs.tempo.value;
    }

    btnOk_click(e) {
        e.preventDefault();
        this.updateSong();
        this.modal.close();
        this.song.render();
    }

    btnCancel_click(e) {
        e.preventDefault();
        this.modal.close();
    }

    async updatePreview() {
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
        this.inputs.style.value = this.song.style;
        this.inputs.tempo.value = this.song.tempo;
        this.modal.showModal();
        if (document.activeElement) {
            document.activeElement.blur();
        }
    }
}

customElements.define('song-editor-modal-template', SongEditorModal);