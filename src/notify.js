import { NotifyCard } from "./components/app/NotifyCard";
import { App } from "./app";

export function notifyUser(NotifyLevel, msg) {
	if (App.NotifyContainer.dataset.status === 'off')
		App.NotifyContainer.dataset.status = 'on';
	const cardContainer = App.NotifyContainer.children[0];
	cardContainer.prepend(new NotifyCard(NotifyLevel, msg, (element) => {
		if (cardContainer.children.length === 0)
			App.NotifyContainer.dataset.status = 'off';
	}));
}
