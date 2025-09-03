import { hydrate, prerender as ssr } from 'preact-iso';

import preactLogo from './assets/preact.svg';
import './style.css';

export function App() {
	return (
		<h1 class="text-3xl font-bold underline">
			Hello world!
		</h1>
	);
}

if (typeof window !== 'undefined') {
	hydrate(<App />, document.getElementById('app'));
}

export async function prerender(data) {
	return await ssr(<App {...data} />);
}
