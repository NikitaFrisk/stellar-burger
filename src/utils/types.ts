// TypeScript интерфейсы для типизации данных

export interface IIngredient {
	_id: string;
	name: string;
	type: string;
	proteins: number;
	fat: number;
	carbohydrates: number;
	calories: number;
	price: number;
	image: string;
	image_mobile: string;
	image_large: string;
	__v?: number;
}

// Типы ингредиентов
export type TIngredientType = 'bun' | 'sauce' | 'main';

// Интерфейс для ингредиента в конструкторе (с уникальным ID)
export interface IConstructorIngredient extends IIngredient {
	uuid?: string;
}

// Интерфейс для заказа
export interface IOrder {
	number: number;
	name?: string;
	status?: string;
	createdAt?: string;
	updatedAt?: string;
	ingredients?: string[];
}

// Интерфейс для пользователя
export interface IUser {
	email: string;
	name: string;
}

// Интерфейс для ответа API
export interface IApiResponse<T> {
	success: boolean;
	data?: T;
	message?: string;
} 