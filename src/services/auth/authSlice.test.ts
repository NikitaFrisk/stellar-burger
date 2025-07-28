import {
	authReducer,
	clearError,
	register,
	login,
	logoutUser
} from './authSlice';

// Интерфейсы для тестирования
interface User {
	email: string;
	name: string;
}

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	loading: boolean;
	error: string | null;
	isPasswordResetRequested: boolean;
}

// Мокаем данные для тестирования
const mockUser: User = {
	email: 'test@example.com',
	name: 'Test User'
};

// Начальное состояние для тестов
const initialState: AuthState = {
	user: null,
	isAuthenticated: false,
	loading: false,
	error: null,
	isPasswordResetRequested: false
};

describe('authSlice', () => {
	// Тестируем начальное состояние
	describe('initial state', () => {
		test('should return the initial state', () => {
			expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
		});
	});

	// Тестируем обычные редьюсеры
	describe('reducers', () => {
		test('should handle clearError', () => {
			const stateWithError = {
				...initialState,
				error: 'Some error'
			};
			
			const action = clearError();
			const state = authReducer(stateWithError, action);
			
			expect(state.error).toBeNull();
		});
	});

	// Тестируем асинхронные действия - register
	describe('register async action', () => {
		test('should handle register.pending', () => {
			const action = register.pending('requestId', { name: 'Test', email: 'test@test.com', password: 'password' });
			const state = authReducer(initialState, action);
			
			expect(state.loading).toBe(true);
			expect(state.error).toBeNull();
		});

		test('should handle register.fulfilled', () => {
			const loadingState = { ...initialState, loading: true };
			const mockResponse = {
				success: true,
				user: mockUser,
				accessToken: 'token',
				refreshToken: 'refresh'
			};
			const action = register.fulfilled(mockResponse, 'requestId', { name: 'Test', email: 'test@test.com', password: 'password' });
			const state = authReducer(loadingState, action);
			
			expect(state.loading).toBe(false);
			expect(state.user).toEqual(mockUser);
			expect(state.isAuthenticated).toBe(true);
			expect(state.error).toBeNull();
		});

		test('should handle register.rejected', () => {
			const loadingState = { ...initialState, loading: true };
			const action = register.rejected(new Error('Registration failed'), 'requestId', { name: 'Test', email: 'test@test.com', password: 'password' }, 'Registration failed');
			const state = authReducer(loadingState, action);
			
			expect(state.loading).toBe(false);
			expect(state.user).toBeNull();
			expect(state.isAuthenticated).toBe(false);
			expect(state.error).toBe('Registration failed');
		});
	});

	// Тестируем асинхронные действия - login
	describe('login async action', () => {
		test('should handle login.pending', () => {
			const action = login.pending('requestId', { email: 'test@test.com', password: 'password' });
			const state = authReducer(initialState, action);
			
			expect(state.loading).toBe(true);
			expect(state.error).toBeNull();
		});

		test('should handle login.fulfilled', () => {
			const loadingState = { ...initialState, loading: true };
			const mockResponse = {
				success: true,
				user: mockUser,
				accessToken: 'token',
				refreshToken: 'refresh'
			};
			const action = login.fulfilled(mockResponse, 'requestId', { email: 'test@test.com', password: 'password' });
			const state = authReducer(loadingState, action);
			
			expect(state.loading).toBe(false);
			expect(state.user).toEqual(mockUser);
			expect(state.isAuthenticated).toBe(true);
			expect(state.error).toBeNull();
		});

		test('should handle login.rejected', () => {
			const loadingState = { ...initialState, loading: true };
			const action = login.rejected(new Error('Login failed'), 'requestId', { email: 'test@test.com', password: 'password' }, 'Login failed');
			const state = authReducer(loadingState, action);
			
			expect(state.loading).toBe(false);
			expect(state.user).toBeNull();
			expect(state.isAuthenticated).toBe(false);
			expect(state.error).toBe('Login failed');
		});
	});
});
