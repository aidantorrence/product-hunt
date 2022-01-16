export function setWithExpiry(key: string, value: any, ttl: number) {
	const now = new Date()

	// `item` is an object which contains the original value
	// as well as the time when it's supposed to expire
	const item = {
		value: value,
		expiry: now.getTime() + ttl * 1000 * 3600,
	}
	localStorage.setItem(key, JSON.stringify(item))
}

export function getWithExpiry(key: string) {
	const itemStr = localStorage.getItem(key)
	// if the item doesn't exist, return null
	if (!itemStr) {
		return null
	}
	const item = JSON.parse(itemStr)
	// compare the expiry time of the item with the current time
	if (new Date().getTime() > item.expiry) {
		// If the item is expired, delete the item from storage
		// and return null
		localStorage.removeItem(key)
		return null
	}
	return item.value
}

export function setWithToken(key: string, value: any, token: string) {
	const now = new Date()

	// `item` is an object which contains the original value
	// as well as the time when it's supposed to expire
	const item = {
		value,
		token,
	}
	localStorage.setItem(key, JSON.stringify(item))
}

export function getWithToken(key: string, token: string) {
	const itemStr = localStorage.getItem(key)
	if (!itemStr) {
		return null
	}
	const item = JSON.parse(itemStr)
	if (token === item.token) {
		return null
	}
	return item.value
}