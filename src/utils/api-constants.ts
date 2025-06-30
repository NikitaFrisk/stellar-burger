// 1 раз объявляем базовый урл
export const BASE_URL = 'https://norma.nomoreparties.space/api';

export const ENDPOINTS = {
	INGREDIENTS: '/ingredients',
	ORDERS: '/orders',
	// Auth endpoints
	REGISTER: '/auth/register',
	LOGIN: '/auth/login',
	LOGOUT: '/auth/logout',
	TOKEN: '/auth/token',
	USER: '/auth/user',
	PASSWORD_RESET: '/password-reset',
	PASSWORD_RESET_CONFIRM: '/password-reset/reset',
} as const;

// Интерфейс для ответа от API
export interface IApiResponse<T = any> {
	success: boolean;
	data?: T;
	message?: string;
	[key: string]: any; // для дополнительных полей от API
}

// создаем функцию проверки ответа на `ok`
const checkResponse = (res: Response): Promise<IApiResponse> => {
	if (res.ok) {
		return res.json();
	}
	// не забываем выкидывать ошибку, чтобы она попала в `catch`
	return Promise.reject(`Ошибка ${res.status}`);
};

// создаем функцию проверки на `success`
const checkSuccess = <T>(res: IApiResponse<T>): IApiResponse<T> => {
	if (res && res.success) {
		return res;
	}
	// не забываем выкидывать ошибку, чтобы она попала в `catch`
	throw new Error(`Ответ не success: ${JSON.stringify(res)}`);
};

/**
 * Универсальная функция запроса с проверкой ответа и `success`
 * В вызов приходит `endpoint` (часть урла, которая идет после базового) и опции
 * 
 * @param {string} endpoint - эндпоинт API (например, '/ingredients')
 * @param {RequestInit} options - опции для fetch (method, headers, body и т.д.)
 * @returns {Promise} - промис с данными ответа
 * 
 * Примеры использования:
 * 
 * // GET запрос (опции можно не передавать)
 * const getIngredients = () => request(ENDPOINTS.INGREDIENTS);
 * 
 * // POST запрос с данными
 * const createOrder = (orderData) => request(ENDPOINTS.ORDERS, {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify(orderData)
 * });
 * 
 * // POST запрос с авторизацией
 * const login = (userData) => request(ENDPOINTS.LOGIN, {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify(userData)
 * });
 */
export const request = <T = any>(endpoint: string, options?: RequestInit): Promise<IApiResponse<T>> => {
	// а также в ней базовый урл сразу прописывается, чтобы не дублировать в каждом запросе
	return fetch(`${BASE_URL}${endpoint}`, options)
		.then(checkResponse)
		.then(checkSuccess<T>);
};

/**
 * Функция для Redux thunks - извлекает данные из IApiResponse
 * Возвращает непосредственно данные, а не обертку
 */
export const requestData = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
	const response = await request<T>(endpoint, options);
	
	// Извлекаем данные из ответа API
	// Если есть поле data, возвращаем его, иначе весь response (для совместимости)
	return (response.data !== undefined ? response.data : response) as T;
};

// Оставляем для обратной совместимости, но лучше использовать request
export { checkResponse }; 