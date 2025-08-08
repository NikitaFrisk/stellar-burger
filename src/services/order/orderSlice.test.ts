import {
	orderReducer,
	orderRequest,
	orderSuccess,
	orderError,
	clearOrder,
	selectOrder,
	selectOrderLoading,
	selectOrderError,
	initialState,
	IOrderState
} from './orderSlice';
import { IOrder } from '@utils/types';
import { RootState } from '../store';

// Мокаем данные для тестирования
const mockOrder: IOrder = {
	number: 12345,
	name: 'Test Burger',
	status: 'done',
	createdAt: '2023-08-23T10:30:00.000Z',
	updatedAt: '2023-08-23T10:30:30.000Z',
	ingredients: ['ingredient1', 'ingredient2']
};

describe('orderSlice', () => {
	// Тестируем начальное состояние
	describe('initial state', () => {
		test('should return the initial state', () => {
			expect(orderReducer(undefined, { type: 'unknown' })).toEqual(initialState);
		});
	});

	// Тестируем редьюсеры
	describe('reducers', () => {
		test('should handle orderRequest', () => {
			const action = orderRequest();
			const state = orderReducer(initialState, action);
			
			expect(state).toEqual({
				order: null,
				loading: true,
				error: null
			});
		});

		test('should handle orderSuccess', () => {
			const loadingState = {
				order: null,
				loading: true,
				error: null
			};
			
			const action = orderSuccess(mockOrder);
			const state = orderReducer(loadingState, action);
			
			expect(state).toEqual({
				order: mockOrder,
				loading: false,
				error: null
			});
		});

		test('should handle orderError', () => {
			const loadingState = {
				order: null,
				loading: true,
				error: null
			};
			
			const errorMessage = 'Failed to create order';
			const action = orderError(errorMessage);
			const state = orderReducer(loadingState, action);
			
			expect(state).toEqual({
				order: null,
				loading: false,
				error: errorMessage
			});
		});

		test('should handle clearOrder', () => {
			const stateWithOrder = {
				order: mockOrder,
				loading: false,
				error: null
			};
			
			const action = clearOrder();
			const state = orderReducer(stateWithOrder, action);
			
			expect(state.order).toBeNull();
			expect(state.loading).toBe(false);
			expect(state.error).toBeNull();
		});

		test('should clear error when starting new request', () => {
			const errorState = {
				order: null,
				loading: false,
				error: 'Previous error'
			};
			
			const action = orderRequest();
			const state = orderReducer(errorState, action);
			
			expect(state.error).toBeNull();
			expect(state.loading).toBe(true);
		});
	});

	// Тестируем селекторы
	describe('selectors', () => {
		const mockState: RootState = {
			order: {
				order: mockOrder,
				loading: false,
				error: null
			}
		} as RootState;

		test('selectOrder should return order', () => {
			const result = selectOrder(mockState);
			expect(result).toEqual(mockOrder);
		});

		test('selectOrder should return null when no order', () => {
			const stateWithoutOrder = {
				...mockState,
				order: { ...mockState.order, order: null }
			};
			
			const result = selectOrder(stateWithoutOrder);
			expect(result).toBeNull();
		});

		test('selectOrderLoading should return loading state', () => {
			const loadingState = {
				...mockState,
				order: { ...mockState.order, loading: true }
			};
			
			const result = selectOrderLoading(loadingState);
			expect(result).toBe(true);
		});

		test('selectOrderError should return error message', () => {
			const errorMessage = 'Test error';
			const errorState = {
				...mockState,
				order: { ...mockState.order, error: errorMessage }
			};
			
			const result = selectOrderError(errorState);
			expect(result).toBe(errorMessage);
		});
	});
});
