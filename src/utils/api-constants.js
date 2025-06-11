export const BASE_URL = 'https://norma.nomoreparties.space/api';

export const ENDPOINTS = {
	INGREDIENTS: '/ingredients',
	ORDERS: '/orders',
};

export const checkResponse = (res) => {
	if (res.ok) {
		return res.json();
	}
	return res.json().then((err) => Promise.reject(err));
};
