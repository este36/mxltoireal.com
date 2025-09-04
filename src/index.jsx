import { hydrate, prerender as ssr } from 'preact-iso'
import * as mxl2irp from 'musicxml-irealpro'
import wasmUrl from 'musicxml-irealpro/wasm-module?url'
import './style.css';
import { signal } from '@preact/signals';

let Songs = signal([]);

function FileInput() {
	return <>
		<label class="z-1 btn btn-primary" for="fileinput">
			Select File(s)...
			<input	class="sr-only"
			 		type="file"
					id="fileinput"
					onChange={(event) => {
						for (const file of event.target.files) {
							if (file.name.endsWith('.mxl')
								|| file.name.endsWith('.xml')
								|| file.name.endsWith('.musicxml'))
							{
								const reader = new FileReader();
								reader.onload = () => {
									const mxl2irp_result = mxl2irp.getIRealProSong(new Uint8Array(reader.result), file.name);
									if (mxl2irp_result.error_code != 0) {
										console.error(mxl2irp.get_error_code_str(mxl2irp_result.error_code))
										return;
									}
									Songs.value = [...Songs.value, mxl2irp_result.item];
								};
								reader.readAsArrayBuffer(file);
							}
						}
						event.target.value = ""; 
					}}/>
		</label>
	</>
}

function Song({irp_song}) {
	return <p>
		Composer: {mxl2irp.irp_song_get_composer(irp_song) || 'Unknown'} <br />
		Tempo: {mxl2irp.irp_song_get_tempo(irp_song) || '120'}
	</p>;
}

function SongsView() {
	return <div class="">
		<FileInput />
		{Songs.value.map((song) => <Song irp_song={song}/>)}
	</div>
}

function FileSelector() {
	return <>
		<div class="relative mt-6 h-[25rem] hidden md:flex flex-col items-center justify-center gap-2">
			<div class="bg-base-content/10 absolute z-0 border border-base-content/20 h-full w-2xl rounded-xl"></div>
			<FileInput />
			<p class="z-1 text-content">Or drag and drop here</p>
		</div>
		<div class="md:hidden">
			<FileInput />
		</div>
	</>
}

export function App() {
	return <>
		<header class="flex flex-col gap-6 items-center text-center">
			<h2 class="py-3 border-b-1 text-2xl w-full">mxltoireal.com</h2>
			<h1 class="font-bold text-3xl">Musicxml to iRealPro converter</h1>
		</header>
		<main>
			{Songs.value.length == 0 ? <FileSelector/> : <SongsView/>}
		</main>
	</>
}

if (typeof window !== 'undefined') {
	hydrate(<App />, document.getElementById('app'));
	mxl2irp.initWasm(wasmUrl);
	window.getIRealProSong = mxl2irp.getIRealProSong;
}

export async function prerender(data) {
	return await ssr(<App {...data} />);
}
