import {
	ingredientDetailsReducer,
	setCurrentIngredient,
	clearCurrentIngredient,
	selectCurrentIngredient
} from './ingredientDetailsSlice';
import { IIngredient } from '@utils/types';
import { RootState } from '../store';

// Интерфейс состояния деталей ингредиента
interface IIngredientDetailsState {
	currentIngredient: IIngredient | null;
}

// Мокаем данные для тестирования
const mockIngredient: IIngredient = {
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
};

// Начальное состояние для тестов
const initialState: IIngredientDetailsState = {
	currentIngredient: null
};

describe('ingredientDetailsSlice', () => {
	// Тестируем начальное состояние
	describe('initial state', () => {
		test('should return the initial state', () => {
			expect(ingredientDetailsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
		});
	});

	// Тестируем редьюсеры
	describe('reducers', () => {
		test('should handle setCurrentIngredient', () => {
			const action = setCurrentIngredient(mockIngredient);
			const state = ingredientDetailsReducer(initialState, action);
			
			expect(state).toEqual({
				currentIngredient: mockIngredient
			});
		});

		test('should handle clearCurrentIngredient', () => {
			const stateWithIngredient = {
				currentIngredient: mockIngredient
			};
			
			const action = clearCurrentIngredient();
			const state = ingredientDetailsReducer(stateWithIngredient, action);
			
			expect(state).toEqual({
				currentIngredient: null
			});
		});

		test('should replace existing ingredient when setting new ingredient', () => {
			const stateWithIngredient = {
				currentIngredient: mockIngredient
			};
			
			const newIngredient = { 
				...mockIngredient, 
				_id: 'new-ingredient-id', 
				name: 'Новый ингредиент' 
			};
			const action = setCurrentIngredient(newIngredient);
			const state = ingredientDetailsReducer(stateWithIngredient, action);
			
			expect(state.currentIngredient).toEqual(newIngredient);
		});
	});

	// Тестируем селекторы
	describe('selectors', () => {
		const mockState: RootState = {
			ingredientDetails: {
				currentIngredient: mockIngredient
			}
		} as RootState;

		test('selectCurrentIngredient should return current ingredient', () => {
			const result = selectCurrentIngredient(mockState);
			expect(result).toEqual(mockIngredient);
		});

		test('selectCurrentIngredient should return null when no ingredient', () => {
			const stateWithoutIngredient = {
				...mockState,
				ingredientDetails: { currentIngredient: null }
			};
			
			const result = selectCurrentIngredient(stateWithoutIngredient);
			expect(result).toBeNull();
		});

		test('selectCurrentIngredient should handle missing ingredientDetails state', () => {
			const stateWithoutIngredientDetails = {} as RootState;
			
			const result = selectCurrentIngredient(stateWithoutIngredientDetails);
			expect(result).toBeNull();
		});
	});
});
