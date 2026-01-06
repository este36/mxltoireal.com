import { renderHTMLElement } from "astro/runtime/server/index.js";
import { Templates } from "../../app";

export const NotifyLevel = {
	Info: 1,
	Warning: 2,
	Error: 3,
}

const TIMEOUT = 3000;

export class NotifyCard extends HTMLElement
{
	constructor(lvl, msg, onDestroy)
	{
		super();
		this.msg = msg;
		this.lvl = lvl;
		this.onDestroy = onDestroy;
		this._destroyed = false;
		this._destroyTimer = null;
		this._timeoutResolve = null;
		this.progressBar = null;
	}

	async _fadeOut() {
		this.classList.add('fade-out');
		return new Promise(r => setTimeout(r, 150));
	}

	async _destroy() {
		if (this._destroyed) return;
		this._destroyed = true;
		if (this._destroyTimer)
			clearTimeout(this._destroyTimer);
		await this._fadeOut();
		this.remove();
		this.onDestroy();
		if (this._timeoutResolve) {
			this._timeoutResolve();
			this._timeoutResolve = null;
		}
	}

	async _animateProgressBar() {
		const start = performance.now();

		while (!this._destroyed) {
			const progress = Math.min(
				(performance.now() - start) / TIMEOUT,
				1
			);
			this.progressBar.value = progress * 100;
			if (progress === 1) break;
			await new Promise(r => requestAnimationFrame(r));
		}
	}

	async timeout() {
		return new Promise(resolve => {
			this._timeoutResolve = resolve;
			this._destroyTimer = setTimeout(async () => {
				if (this._destroyed) return;
				await this._fadeOut();
				this._destroyTimer = null;
				this._destroy();
			}, TIMEOUT);
			this._animateProgressBar();
		});
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
		quitBtn.addEventListener('click', async () => {
			if (!this._destroyed) {
				if (this._destroyTimer) clearTimeout(this._destroyTimer);
				this._destroy();
			}
		});

		this.progressBar = this.querySelector('progress');
	}
}

customElements.define("notify-card-template", NotifyCard);