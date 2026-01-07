import { NotifyCard } from "./components/app/NotifyCard";
import { App } from "./app";

let notifLoopRunning = false;

async function notifsTimeout() {
	const cardContainer = App.NotifyContainer.children[0];
	notifLoopRunning = true;
	while (cardContainer.children.length !== 0) {
		await cardContainer.children[0].timeout();
	}
	notifLoopRunning = false;
}

export function notifyUser(NotifyLevel, msg) {
	if (App.NotifyContainer.dataset.status === 'off') {
		App.NotifyContainer.dataset.status = 'on';
	}

	const cardContainer = App.NotifyContainer.children[0];
	cardContainer.appendChild(new NotifyCard(NotifyLevel, msg, (element) => {
		if (cardContainer.children.length === 0)
			App.NotifyContainer.dataset.status = 'off';
	}));

	if (!notifLoopRunning) {
		requestAnimationFrame(() => {
			notifsTimeout();
		});
	}
}
