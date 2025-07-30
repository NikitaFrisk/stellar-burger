import {
	ingredientsReducer,
	getIngredientsRequest,
	getIngredientsSuccess,
	getIngredientsError,
	fetchIngredients,
	selectIngredients,
	selectIngredientsLoading,
	selectIngredientsError,
	initialState,
	IIngredientsState
} from './ingredientsSlice';
import { IIngredient } from '@utils/types';
import { RootState } from '../store';
import { request } from '../../utils/api-constants';

// Мокаем API
jest.mock('../../utils/api-constants');
const mockedRequest = request as jest.MockedFunction<typeof request>;

// Мокаем данные для тестирования
const mockIngredients: IIngredient[] = [
	{
		_id: '643d69a5c3f7b9001cfa093c',
		name: 'Краторная булка N-200i',
		type: 'bun',
		proteins: 80,
		fat: 24,
		carbohydrates: 53,
		calories: 420,
		price: 1255,
		image: 'https://code.s3.yandex.net/react/code/bun-02.png',
		image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
		image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png',
		__v: 0
	},
	{
		_id: '643d69a5c3f7b9001cfa0941',
		name: 'Биокотлета из марсианской Магнолии',
		type: 'main',
		proteins: 420,
		fat: 142,
		carbohydrates: 242,
		calories: 4242,
		price: 424,
		image: 'https://code.s3.yandex.net/react/code/meat-01.png',
		image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png',
		image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png',
		__v: 0
	}
];

describe('ingredientsSlice', () => {
	// Тестируем начальное состояние
	describe('initial state', () => {
		test('should return the initial state', () => {
			expect(ingredientsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
		});
	});

	// Тестируем редьюсеры
	describe('reducers', () => {
		test('should handle getIngredientsRequest', () => {
			const action = getIngredientsRequest();
			const state = ingredientsReducer(initialState, action);
			
			expect(state).toEqual({
				items: [],
				loading: true,
				error: null
			});
		});

		test('should handle getIngredientsSuccess', () => {
			const loadingState = {
				items: [],
				loading: true,
				error: null
			};
			
			const action = getIngredientsSuccess(mockIngredients);
			const state = ingredientsReducer(loadingState, action);
			
			expect(state).toEqual({
				items: mockIngredients,
				loading: false,
				error: null
			});
		});

		test('should handle getIngredientsError', () => {
			const loadingState = {
				items: [],
				loading: true,
				error: null
			};
			
			const errorMessage = 'Failed to fetch ingredients';
			const action = getIngredientsError(errorMessage);
			const state = ingredientsReducer(loadingState, action);
			
			expect(state).toEqual({
				items: [],
				loading: false,
				error: errorMessage
			});
		});

		test('should clear error when starting new request', () => {
			const errorState = {
				items: [],
				loading: false,
				error: 'Previous error'
			};
			
			const action = getIngredientsRequest();
			const state = ingredientsReducer(errorState, action);
			
			expect(state.error).toBeNull();
			expect(state.loading).toBe(true);
		});
	});

	// Тестируем асинхронные действия
	describe('async actions', () => {
		test('fetchIngredients should dispatch success action on successful API call', async () => {
			const mockDispatch = jest.fn();
			const mockResponse = { data: mockIngredients, success: true };
			
			mockedRequest.mockResolvedValueOnce(mockResponse);
			
			const thunk = fetchIngredients();
			await thunk(mockDispatch);
			
			expect(mockDispatch).toHaveBeenCalledWith(getIngredientsRequest());
			expect(mockDispatch).toHaveBeenCalledWith(getIngredientsSuccess(mockIngredients));
			expect(mockDispatch).toHaveBeenCalledTimes(2);
		});

		test('fetchIngredients should dispatch error action on API failure', async () => {
			const mockDispatch = jest.fn();
			const errorMessage = 'Network error';
			
			mockedRequest.mockRejectedValueOnce(new Error(errorMessage));
			
			const thunk = fetchIngredients();
			await thunk(mockDispatch);
			
			expect(mockDispatch).toHaveBeenCalledWith(getIngredientsRequest());
			expect(mockDispatch).toHaveBeenCalledWith(getIngredientsError(errorMessage));
			expect(mockDispatch).toHaveBeenCalledTimes(2);
		});
	});

	// Тестируем селекторы
	describe('selectors', () => {
		const mockState: RootState = {
			ingredients: {
				items: mockIngredients,
				loading: false,
				error: null
			}
		} as RootState;

		test('selectIngredients should return ingredients array', () => {
			const result = selectIngredients(mockState);
			expect(result).toEqual(mockIngredients);
		});

		test('selectIngredientsLoading should return loading state', () => {
			const loadingState = {
				...mockState,
				ingredients: { ...mockState.ingredients, loading: true }
			};
			
			const result = selectIngredientsLoading(loadingState);
			expect(result).toBe(true);
		});

		test('selectIngredientsError should return error message', () => {
			const errorMessage = 'Test error';
			const errorState = {
				...mockState,
				ingredients: { ...mockState.ingredients, error: errorMessage }
			};
			
			const result = selectIngredientsError(errorState);
			expect(result).toBe(errorMessage);
		});

		test('selectors should handle undefined state', () => {
			const undefinedState = {} as RootState;
			
			expect(selectIngredients(undefinedState)).toEqual([]);
			expect(selectIngredientsLoading(undefinedState)).toBe(false);
			expect(selectIngredientsError(undefinedState)).toBeNull();
		});
	});
});
