import feedReducer, {
	connectToFeed,
	connectionSuccess,
	connectionError,
	connectionClosed,
	messageReceived,
	clearFeed,
	selectFeedOrders,
	selectFeedTotal,
	selectFeedTotalToday,
	selectFeedConnected,
	selectFeedError
} from './feedSlice';
import { IFeedOrder, IFeedMessage } from '../../utils/types';
import { RootState } from '../store';

// Интерфейс состояния ленты заказов
interface FeedState {
	orders: IFeedOrder[];
	total: number;
	totalToday: number;
	isConnecting: boolean;
	isConnected: boolean;
	error: string | null;
	connectionUrl: string | null;
}

// Мокаем данные для тестирования
const mockOrder: IFeedOrder = {
	_id: '64e5f9e5bb0c9e3d65b74e56',
	ingredients: ['ingredient1', 'ingredient2'],
	status: 'done',
	name: 'Test Burger',
	createdAt: '2023-08-23T10:30:00.000Z',
	updatedAt: '2023-08-23T10:30:30.000Z',
	number: 12345
};

const mockFeedMessage: IFeedMessage = {
	success: true,
	orders: [mockOrder],
	total: 100,
	totalToday: 10
};

// Начальное состояние для тестов
const initialState: FeedState = {
	orders: [],
	total: 0,
	totalToday: 0,
	isConnecting: false,
	isConnected: false,
	error: null,
	connectionUrl: null
};

describe('feedSlice', () => {
	// Тестируем начальное состояние
	describe('initial state', () => {
		test('should return the initial state', () => {
			expect(feedReducer(undefined, { type: 'unknown' })).toEqual(initialState);
		});
	});

	// Тестируем редьюсеры
	describe('reducers', () => {
		test('should handle connectToFeed', () => {
			const url = 'ws://localhost:3001';
			const action = connectToFeed(url);
			const state = feedReducer(initialState, action);
			
			expect(state).toEqual({
				...initialState,
				isConnecting: true,
				isConnected: false,
				error: null,
				connectionUrl: url
			});
		});

		test('should handle connectionSuccess', () => {
			const connectingState = {
				...initialState,
				isConnecting: true,
				connectionUrl: 'ws://localhost:3001'
			};
			
			const action = connectionSuccess();
			const state = feedReducer(connectingState, action);
			
			expect(state).toEqual({
				...connectingState,
				isConnecting: false,
				isConnected: true,
				error: null
			});
		});

		test('should handle connectionError', () => {
			const connectingState = {
				...initialState,
				isConnecting: true,
				connectionUrl: 'ws://localhost:3001'
			};
			
			const errorMessage = 'Connection failed';
			const action = connectionError(errorMessage);
			const state = feedReducer(connectingState, action);
			
			expect(state).toEqual({
				...connectingState,
				isConnecting: false,
				isConnected: false,
				error: errorMessage
			});
		});

		test('should handle connectionClosed', () => {
			const connectedState = {
				...initialState,
				isConnected: true,
				connectionUrl: 'ws://localhost:3001'
			};
			
			const action = connectionClosed();
			const state = feedReducer(connectedState, action);
			
			expect(state).toEqual({
				...connectedState,
				isConnecting: false,
				isConnected: false,
				connectionUrl: 'ws://localhost:3001'
			});
		});

		test('should handle messageReceived', () => {
			const connectedState = {
				...initialState,
				isConnected: true
			};
			
			const action = messageReceived(mockFeedMessage);
			const state = feedReducer(connectedState, action);
			
			expect(state).toEqual({
				...connectedState,
				orders: mockFeedMessage.orders,
				total: mockFeedMessage.total,
				totalToday: mockFeedMessage.totalToday,
				error: null
			});
		});

		test('should handle clearFeed', () => {
			const stateWithData = {
				...initialState,
				orders: [mockOrder],
				total: 100,
				totalToday: 10,
				error: 'Some error'
			};
			
			const action = clearFeed();
			const state = feedReducer(stateWithData, action);
			
			expect(state).toEqual(initialState);
		});
	});

	// Тестируем селекторы
	describe('selectors', () => {
		const mockState: RootState = {
			feed: {
				orders: [mockOrder],
				total: 100,
				totalToday: 10,
				isConnecting: false,
				isConnected: true,
				error: null,
				connectionUrl: 'ws://localhost:3001'
			}
		} as RootState;

		test('selectFeedOrders should return orders array', () => {
			const result = selectFeedOrders(mockState);
			expect(result).toEqual([mockOrder]);
		});

		test('selectFeedTotal should return total count', () => {
			const result = selectFeedTotal(mockState);
			expect(result).toBe(100);
		});

		test('selectFeedTotalToday should return today count', () => {
			const result = selectFeedTotalToday(mockState);
			expect(result).toBe(10);
		});

		test('selectFeedConnected should return connection status', () => {
			const result = selectFeedConnected(mockState);
			expect(result).toBe(true);
		});

		test('selectFeedError should return error message', () => {
			const errorState = {
				...mockState,
				feed: { ...mockState.feed, error: 'Test error' }
			};
			
			const result = selectFeedError(errorState);
			expect(result).toBe('Test error');
		});

		test('selectFeedError should return null when no error', () => {
			const result = selectFeedError(mockState);
			expect(result).toBeNull();
		});
	});
});
