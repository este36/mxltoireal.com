import { renderHTMLElement } from "astro/runtime/server/index.js";
import { Templates } from "../../app";

export const NotifyLevel = {
	Info: 1,
	Warning: 2,
	Error: 3,
}

export class NotifyCard extends HTMLElement
{
	constructor(lvl, msg, onDestroy)
	{
		super();
		this.msg = msg;
		this.lvl = lvl;
		this.onDestroy = onDestroy;
		this._destroyed = false;
	}

	async _timeout()
	{
		await new Promise(r => setTimeout(r, 17000));
		if (this._destroyed)
			return;
		this.classList.add('fade-out');
		await new Promise(r => setTimeout(r, 3000));
		this._destroy();
	}

	async _destroy() {
		if (this._destroyed) return;
		this._destroyed = true;
		this.remove();
		this.onDestroy();
	}

	connectedCallback()
	{
		this.appendChild(Templates.NotifyCard.content.cloneNode(true));
		this.classList.add(...Templates.NotifyCard.classList);
		const errorText = document.createElement('span');
		errorText.style.fontWeight = 700;
		errorText.style.paddingRight = '.5ch';
		const msgText = document.createElement('span');
		msgText.style.fontWeight = 500;
		switch (this.lvl) {
			case NotifyLevel.Info:
				this.classList.add("notify-info");
				break;
			case NotifyLevel.Warning:
				this.classList.add("notify-warning");
				break;
			case NotifyLevel.Error:
				this.classList.add("notify-error");
				errorText.textContent = "Error! ";
				msgText.textContent = this.msg;
				break;
			default:
				throw new Error("Unknown NotifyLevel");
		}
		this.appendChild(errorText);
		this.appendChild(msgText);
		
		const quitBtn = this.querySelector('btn-square-template');
		quitBtn.addEventListener('click', () => {
			this._destroy();
		});

		this._timeout();
	}
}

customElements.define("notify-card-template", NotifyCard);