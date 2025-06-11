import { Routes, Route, BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import { AppHeader } from '../app-header/app-header';
import { Modal } from '../modal/modal';
import { IngredientDetails } from '../ingredient-details/ingredient-details';
import { OrderDetails } from '../order-details/order-details';
import { Loader } from '../loader/loader';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../services/store';
import { ProtectedRoute } from '../protected-route/protected-route';
import styles from './app.module.scss';
import { fetchIngredients, selectIngredients } from '../../services/ingredients/ingredientsSlice';
import {
	clearCurrentIngredient,
	selectCurrentIngredient,
	setCurrentIngredient,
} from '../../services/ingredient-details/ingredientDetailsSlice';
import { selectOrder, selectOrderLoading, clearOrder } from '../../services/order/orderSlice';
import { getUser } from '../../services/auth/authSlice';
import { getCookie } from '../../utils/cookie';
import {
	HomePage,
	LoginPage,
	RegisterPage,
	ForgotPasswordPage,
	ResetPasswordPage,
	ProfilePage,
	IngredientPage,
	NotFoundPage,
} from '../../pages';

	const AppContent = () => {
	const dispatch = useAppDispatch();
	const selectedIngredient = useAppSelector(selectCurrentIngredient);
	const ingredients = useAppSelector(selectIngredients);
	const order = useAppSelector(selectOrder);
	const orderLoading = useAppSelector(selectOrderLoading);
	const location = useLocation();
	const navigate = useNavigate();

	// Получаем background location для модальных окон
	const background = location.state && location.state.background;
	
	// Проверяем, это модальное окно из sessionStorage (для сохранения при обновлении)
	const isModalFromStorage = location.pathname.startsWith('/ingredients/') && 
		sessionStorage.getItem('modalIngredient');

	useEffect(() => {
		dispatch(fetchIngredients());
		
		// Проверяем, есть ли сохраненные токены при инициализации
		const refreshToken = getCookie('refreshToken');
		const accessToken = localStorage.getItem('accessToken');
		
		if (refreshToken && accessToken) {
			dispatch(getUser());
		}
	}, [dispatch]);

	// Восстанавливаем selectedIngredient при обновлении модалки
	useEffect(() => {
		if (isModalFromStorage && ingredients.length > 0 && !selectedIngredient) {
			const ingredientId = location.pathname.split('/ingredients/')[1];
			const ingredient = ingredients.find(item => item._id === ingredientId);
			if (ingredient) {
				dispatch(setCurrentIngredient(ingredient));
			}
		}
	}, [isModalFromStorage, ingredients, selectedIngredient, location.pathname, dispatch]);

	const handleCloseModal = () => {
		if (selectedIngredient) {
			dispatch(clearCurrentIngredient());
		}
		if (order) {
			dispatch(clearOrder());
		}
		// Очищаем sessionStorage при закрытии модалки
		sessionStorage.removeItem('modalIngredient');
		// Возвращаемся к предыдущей странице если есть background
		if (background) {
			navigate(-1);
		} else if (isModalFromStorage) {
			// Если это было модальное окно из storage, идем на главную
			navigate('/');
		}
	};

	return (
		<div className={styles.app}>
			<AppHeader />

			<Routes location={background || (isModalFromStorage ? { pathname: '/' } : location)}>
				<Route path='/' element={<HomePage />} />
				<Route
					path='/login'
					element={<ProtectedRoute element={<LoginPage />} onlyUnAuth={true} />}
				/>
				<Route
					path='/register'
					element={<ProtectedRoute element={<RegisterPage />} onlyUnAuth={true} />}
				/>
				<Route
					path='/forgot-password'
					element={
						<ProtectedRoute element={<ForgotPasswordPage />} onlyUnAuth={true} />
					}
				/>
				<Route
					path='/reset-password'
					element={<ResetPasswordPage />}
				/>
				<Route
					path='/profile'
					element={<ProtectedRoute element={<ProfilePage />} />}
				/>
				{/* Отдельная страница ингредиента только при прямом переходе без модалки */}
				{!background && !isModalFromStorage && <Route path='/ingredients/:id' element={<IngredientPage />} />}
				<Route path='*' element={<NotFoundPage />} />
			</Routes>

			{/* Показываем модальное окно если есть background ИЛИ сохранено в sessionStorage */}
			{(background || isModalFromStorage) && location.pathname.startsWith('/ingredients/') && selectedIngredient && (
				<Modal title='Детали ингредиента' onClose={handleCloseModal}>
					<IngredientDetails ingredient={selectedIngredient} />
				</Modal>
			)}

			{(order || orderLoading) && (
				<Modal 
					title='' 
					onClose={handleCloseModal}
					closable={!orderLoading}
				>
					{orderLoading ? (
						<Loader text="Оформляем ваш заказ..." size="large" />
					) : (
						<OrderDetails orderNumber={order.number} />
					)}
				</Modal>
			)}
		</div>
	);
};

export const App = () => {
	return (
		<BrowserRouter>
			<AppContent />
		</BrowserRouter>
	);
};
