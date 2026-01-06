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
	}

	async _Timeout()
	{
		await new Promise(r => setTimeout(r, 7000));
		this.classList.add('fade-out');
		await new Promise(r => setTimeout(r, 3000));
		this.remove();
		this.onDestroy();
	}

	connectedCallback()
	{
		this.appendChild(Templates.NotifyCard.content.cloneNode(true));
		this.classList.add(...Templates.NotifyCard.classList);
		switch (this.lvl) {
			case NotifyLevel.Info:
				this.classList.add("notify-info");
				break;
			case NotifyLevel.Warning:
				this.classList.add("notify-warning");
				break;
			case NotifyLevel.Error:
				this.classList.add("notify-error");
				break;
			default:
				throw new Error("Unknown NotifyLevel");
		}
		const errorText = document.createElement('span');
		errorText.textContent = "Error : ";
		errorText.style.fontWeight = 700;
		errorText.style.paddingRight = '.5ch';
		this.appendChild(errorText);
		const msgText = document.createElement('span');
		msgText.textContent = this.msg;
		msgText.style.fontWeight = 500
		this.appendChild(msgText);
		this._Timeout();
	}
}

customElements.define("notify-card-template", NotifyCard);