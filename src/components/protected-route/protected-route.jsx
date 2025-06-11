import { useAppSelector } from '../../services/store';
import { Navigate, useLocation } from 'react-router-dom';
import { selectIsAuthenticated, selectAuthLoading } from '../../services/auth/authSlice';
import { getCookie } from '../../utils/cookie';
import { Loader } from '../loader/loader';
import PropTypes from 'prop-types';

export const ProtectedRoute = ({ element, onlyUnAuth = false }) => {
	const isAuthenticated = useAppSelector(selectIsAuthenticated);
	const loading = useAppSelector(selectAuthLoading);
	const location = useLocation();

	// Проверяем наличие токенов
	const hasTokens = getCookie('refreshToken') && localStorage.getItem('accessToken');

	// Если загружается - показываем loader
	if (loading) {
		return <Loader text="Проверка авторизации..." size="small" />;
	}

	// Для страниц только для неавторизованных (логин, регистрация)
	if (onlyUnAuth && isAuthenticated) {
		const { from } = location.state || { from: { pathname: '/' } };
		return <Navigate to={from} />;
	}

	// Для приватных страниц - проверяем только isAuthenticated
	// Если токены есть, но isAuthenticated = false, значит они невалидны
	if (!onlyUnAuth && !isAuthenticated) {
		return <Navigate to='/login' state={{ from: location }} />;
	}

	return element;
};

ProtectedRoute.propTypes = {
	element: PropTypes.element.isRequired,
	onlyUnAuth: PropTypes.bool,
}; 