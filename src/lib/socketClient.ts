
export const getSocketAdress = () => {
	const isDev = false
	if (isDev) {
		return 'ws://localhost:8787';
	} else {
		return 'wss://bottomgear.uhlo.workers.dev';
	}
}
