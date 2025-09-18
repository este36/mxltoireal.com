import { Templates } from "../app";

export class BtnSquare extends HTMLElement
{
	constructor(opt)
	{
		super();
		this.opt = opt;
	}

	connectedCallback()
	{
		if (!this.opt) {
			this.opt = {
				use: this.getAttribute('use'),
				fill: this.getAttribute('fill')
			}
		}
		this.appendChild(Templates.BtnSquare.content.cloneNode(true));
		this.classList.add(...Templates.BtnSquare.classList);
		this.querySelector('svg > use').setAttribute('href', this.opt.use);
		if (this.opt.fill)
			this.querySelector('svg').setAttribute('fill', this.opt.fill);
	}
}

customElements.define("btn-square-template", BtnSquare);