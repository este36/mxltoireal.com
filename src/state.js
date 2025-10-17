import { Wasm } from "musicxml-irealpro";
import { deflateSync, inflateSync } from 'fflate';

const DB_NAME = 'local_state';
const STORE_NAME = 'entries';

const Entries = {
	LastState: 'last-state'
};

function UnixNow() {
	return Math.floor(Date.now() / 1000);
}

export class LocalState
{
	constructor () {
		this.WasmHeap = new Uint8Array();
		this.SongsPtrs = [];
		this.LastUpdate = 0;
		this.PlaylistName = '';
	}
	isValid() {
		const now = UnixNow();
		return (
			this.WasmHeap != null
			&& this.SongsPtrs != null 
			&& this.LastUpdate != null 
			&& (now - this.LastUpdate) < 300 // less than 5 minutes
		);
	}
}

class DBInstance
{
	constructor(db) {
		this.db = db;
	}

	async getValueFromId(id) {
		return new Promise((resolve, reject) => {
			const tx = this.db.transaction(STORE_NAME, 'readonly');
			const store = tx.objectStore(STORE_NAME);
			const request = store.get(id);
			request.onsuccess = () => resolve(request.result?.data || null);
			request.onerror = () => reject(request.result);
		});
	}

	async setValueFromId(id, value) {
		return new Promise((resolve, reject) => {
			const tx = this.db.transaction(STORE_NAME, "readwrite");
			const store = tx.objectStore(STORE_NAME);
			const request = store.put({ id, data: value });
			request.onsuccess = () => resolve(true);
			request.onerror = () => reject(request.error);
		});
	}
}

async function createInstance() {
	const request = indexedDB.open(DB_NAME);
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve(new DBInstance(request.result));
		request.onerror = () => reject(request.result);
		request.onupgradeneeded = (event) => {
			const db = event.target.result;
			db.createObjectStore(STORE_NAME, { keyPath: 'id'});
		};
	})
}

export async function getLocalState() {
	const db = await createInstance();
	const lastState = await db.getValueFromId(Entries.LastState);
	return (lastState ? Object.assign(new LocalState(), lastState) : new LocalState())
}

export async function setLocalState(songs, playlistName) {
	// const perf1 = performance.now();
	const localState = new LocalState();
	const db = await createInstance();
	// console.log('setLocalState: ');
	// console.log('	instance: ', (performance.now() - perf1) + 'ms');
	for (const song of songs) {
		localState.SongsPtrs.push(song.ptr);
	}
	localState.PlaylistName = playlistName;
	localState.WasmHeap = (songs.length === 0 ? null : Wasm.HEAPU8);
	localState.LastUpdate = UnixNow();
	// console.log('	setValueBegin: ', (performance.now() - perf1) + 'ms');
	await db.setValueFromId(Entries.LastState, localState);
	// console.log('	final: ', (performance.now() - perf1) + 'ms');
}

window.setLocalState = setLocalState;
window.getLocalState = getLocalState;