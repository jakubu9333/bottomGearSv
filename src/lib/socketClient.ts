
export const getSocketAdress = () => {
	const isDev = true
	if (isDev) {
		return 'ws://localhost:8787';
	} else {
		return 'wss://bottomgear.uhlo.workers.dev';
	}
}
