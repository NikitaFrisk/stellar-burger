import { IIngredient, IOrder, IUser } from './types';

/**
 * Строгая типизация для API запросов и ответов
 */

// Базовые типы для API
export interface IStrictApiResponse<T = any> {
	success: boolean;
	data?: T;
	message?: string;
}

export interface IApiError {
	success: false;
	message: string;
	statusCode?: number;
}

// Типы для аутентификации
export interface ILoginRequest {
	email: string;
	password: string;
}

export interface IRegisterRequest {
	name: string;
	email: string;
	password: string;
}

export interface IResetPasswordRequest {
	password: string;
	token: string;
}

export interface IUpdateUserRequest {
	name?: string;
	email?: string;
	password?: string;
}

export interface IAuthResponse {
	success: true;
	accessToken: string;
	refreshToken: string;
	user: IUser;
}

export interface IRefreshTokenResponse {
	success: true;
	accessToken: string;
	refreshToken: string;
}

export interface IPasswordResetResponse {
	success: true;
	message: string;
}

// Типы для ингредиентов
export interface IIngredientsResponse {
	success: true;
	data: IIngredient[];
}

// Типы для заказов
export interface ICreateOrderRequest {
	ingredients: string[];
}

export interface ICreateOrderResponse {
	success: true;
	name: string;
	order: IOrder;
}

// Типы для пользователя
export interface IUserResponse {
	success: true;
	user: IUser;
}

export interface IUpdateUserResponse {
	success: true;
	user: IUser;
}

// Union типы для всех возможных ответов
export type TApiResponse<T = any> = IStrictApiResponse<T> | IApiError;

// Типы для HTTP методов
export type THttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

// Конфигурация для запросов
export interface IRequestConfig {
	method?: THttpMethod;
	headers?: Record<string, string>;
	body?: string;
}

// Типы для endpoints
export const API_ENDPOINTS = {
	// Auth endpoints
	LOGIN: '/auth/login',
	REGISTER: '/auth/register',
	LOGOUT: '/auth/logout',
	TOKEN: '/auth/token',
	USER: '/auth/user',
	
	// Password reset endpoints
	PASSWORD_RESET: '/password-reset',
	PASSWORD_RESET_RESET: '/password-reset/reset',
	
	// Data endpoints
	INGREDIENTS: '/ingredients',
	ORDERS: '/orders',
} as const;

export type TApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];

// Типы для статусов запросов
export type TRequestStatus = 'idle' | 'loading' | 'success' | 'error';

// Интерфейс для состояния загрузки в slice
export interface IAsyncState {
	loading: boolean;
	error: string | null;
}

// Типы для async thunk действий
export interface IAsyncThunkConfig {
	state: any; // Можно заменить на RootState если нужно
	dispatch: any;
	rejectValue: string;
}

// Утилитарные типы для обработки ошибок
export interface IErrorWithMessage {
	message: string;
}

export interface IErrorWithStatus extends IErrorWithMessage {
	status: number;
}

export type TApiError = IErrorWithMessage | IErrorWithStatus | Error; 