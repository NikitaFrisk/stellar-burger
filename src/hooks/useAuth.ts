import { useAppSelector } from '../services/store';
import {
	selectAuthLoading,
	selectAuthError,
	selectIsAuthenticated,
	selectUser,
	selectIsPasswordResetRequested,
} from '../services/auth/authSlice';

/**
 * Хук для работы с состоянием аутентификации
 * Консолидирует все селекторы в одном месте
 */
export const useAuth = () => {
	const loading = useAppSelector(selectAuthLoading);
	const error = useAppSelector(selectAuthError);
	const isAuthenticated = useAppSelector(selectIsAuthenticated);
	const user = useAppSelector(selectUser);
	const isPasswordResetRequested = useAppSelector(selectIsPasswordResetRequested);

	return {
		loading,
		error,
		isAuthenticated,
		user,
		isPasswordResetRequested,
	};
}; 