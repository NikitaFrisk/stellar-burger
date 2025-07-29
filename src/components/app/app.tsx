import {
	Routes,
	Route,
	BrowserRouter,
	useLocation,
	useNavigate,
	useParams,
	Location,
} from 'react-router-dom';
import { Suspense } from 'react';
import { AppHeader } from '../app-header/app-header';
import { Modal } from '../modal/modal';
import { IngredientDetails } from '../ingredient-details/ingredient-details';
import { OrderDetails } from '../order-details/order-details';
import { Loader } from '../loader/loader';
import { LoadingSpinner } from '../ui';
import { ErrorBoundary } from '../error-boundary';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../services/store';
import { ProtectedRoute } from '../protected-route/protected-route';
import styles from './app.module.scss';
import {
	fetchIngredients,
	selectIngredients,
} from '../../services/ingredients/ingredientsSlice';
import {
	clearCurrentIngredient,
	selectCurrentIngredient,
	setCurrentIngredient,
} from '../../services/ingredient-details/ingredientDetailsSlice';
import {
	selectOrder,
	selectOrderLoading,
	clearOrder,
} from '../../services/order/orderSlice';
import { getUser } from '../../services/auth/authSlice';
import { getCookie } from '../../utils/cookie';
import { selectOrderHistoryOrderByNumber } from '../../services/order-history/orderHistorySlice';
import { selectOrderDetailsOrder } from '../../services/order-details/orderDetailsSlice';
import {
	HomePage,
	LoginPage,
	RegisterPage,
	ForgotPasswordPage,
	ResetPasswordPage,
	ProfilePage,
	IngredientPage,
	NotFoundPage,
	FeedPage,
	OrderInfoPage,
} from '../../pages';

interface LocationState {
	backgroundLocation?: Location;
}

// Modal order details component for feed orders
const ModalFeedOrderDetails: React.FC = () => {
	const navigate = useNavigate();
	const { number } = useParams<{ number: string }>();
	const orderNumber = number ? parseInt(number) : 0;
	
	const handleClose = () => {
		// Go back to the previous location
		navigate(-1);
	};

	return (
		<Modal title={`#${String(orderNumber).padStart(6, '0')}`} onClose={handleClose}>
			<OrderInfoPage hideOrderNumber={true} />
		</Modal>
	);
};

// Modal order details component for profile orders
const ModalProfileOrderDetails: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { number } = useParams<{ number: string }>();
	const orderNumberFromParams = number ? parseInt(number) : 0;
	
	// Пытаемся получить заказ для правильного отображения номера
	const orderFromHistory = useAppSelector(state => 
		selectOrderHistoryOrderByNumber(state, orderNumberFromParams)
	);
	const orderFromAPI = useAppSelector(selectOrderDetailsOrder);
	const order = orderFromHistory || orderFromAPI;
	const displayOrderNumber = order?.number || orderNumberFromParams;
	
	const handleClose = () => {
		// Если есть backgroundLocation (пришли из другой страницы), возвращаемся назад
		const backgroundLocation = (location.state as LocationState)?.backgroundLocation;
		if (backgroundLocation) {
			navigate(-1);
		} else {
			// Если прямая загрузка, идем на страницу профиля
			navigate('/profile/orders');
		}
	};

	return (
		<ProtectedRoute 
			element={
				<Modal title={`#${String(displayOrderNumber).padStart(6, '0')}`} onClose={handleClose}>
					<OrderInfoPage hideOrderNumber={true} />
				</Modal>
			} 
		/>
	);
};

const AppContent: React.FC = () => {
	const dispatch = useAppDispatch();
	const selectedIngredient = useAppSelector(selectCurrentIngredient);
	const ingredients = useAppSelector(selectIngredients);
	const order = useAppSelector(selectOrder);
	const orderLoading = useAppSelector(selectOrderLoading);
	const location = useLocation();
	const navigate = useNavigate();

	// Получаем background location для модальных окон
	const backgroundLocation = (location.state as LocationState)?.backgroundLocation;

	// Проверяем, это модальное окно из sessionStorage (для сохранения при обновлении)
	const isModalFromStorage =
		location.pathname.startsWith('/ingredients/') &&
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
			const ingredient = ingredients.find((item) => item._id === ingredientId);
			if (ingredient) {
				dispatch(setCurrentIngredient(ingredient));
			}
		}
	}, [
		isModalFromStorage,
		ingredients,
		selectedIngredient,
		location.pathname,
		dispatch,
	]);

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
		if (backgroundLocation) {
			navigate(-1);
		} else if (isModalFromStorage) {
			// Если это было модальное окно из storage, идем на главную
			navigate('/');
		}
	};

	return (
		<div className={styles.app}>
			<AppHeader />
			<Suspense fallback={<LoadingSpinner text="Загрузка страницы..." />}>
				<Routes location={backgroundLocation || location}>
					<Route path='/' element={<HomePage />} />
					
					{/* Лента заказов (публичная) */}
					<Route path='/feed' element={<FeedPage />} />
					<Route path='/feed/:number' element={<OrderInfoPage />} />
					
					<Route
						path='/login'
						element={<ProtectedRoute element={<LoginPage />} onlyUnAuth />}
					/>
					<Route
						path='/register'
						element={<ProtectedRoute element={<RegisterPage />} onlyUnAuth />}
					/>
					<Route
						path='/forgot-password'
						element={
							<ProtectedRoute element={<ForgotPasswordPage />} onlyUnAuth />
						}
					/>
					<Route
						path='/reset-password'
						element={
							<ProtectedRoute element={<ResetPasswordPage />} onlyUnAuth />
						}
					/>
					
					{/* Защищенные маршруты профиля */}
					<Route
						path='/profile/*'
						element={<ProtectedRoute element={<ProfilePage />} />}
					/>
					<Route
						path='/profile/orders/:number'
						element={<ProtectedRoute element={<OrderInfoPage />} />}
					/>
					
					{/* Отдельная страница ингредиента только при прямом переходе без модалки */}
					{!backgroundLocation && !isModalFromStorage && (
						<Route path='/ingredients/:id' element={<IngredientPage />} />
					)}
					<Route path='*' element={<NotFoundPage />} />
				</Routes>
			</Suspense>

			{/* Показываем модальное окно если есть background ИЛИ сохранено в sessionStorage */}
			{(backgroundLocation || isModalFromStorage) &&
				location.pathname.startsWith('/ingredients/') &&
				selectedIngredient && (
					<Modal title='Детали ингредиента' onClose={handleCloseModal}>
						<IngredientDetails ingredient={selectedIngredient} />
					</Modal>
				)}

			{/* Модальные окна для заказов */}
			{backgroundLocation && (
				<Routes>
					<Route path='/feed/:number' element={<ModalFeedOrderDetails />} />
					<Route path='/profile/orders/:number' element={<ModalProfileOrderDetails />} />
				</Routes>
			)}

			{/* Модальные окна профиля заказов при прямой загрузке (без backgroundLocation) */}
			{!backgroundLocation && location.pathname.startsWith('/profile/orders/') && location.pathname !== '/profile/orders' && (
				<ModalProfileOrderDetails />
			)}

			{(order || orderLoading) && (
				<Modal title='' onClose={handleCloseModal} closable={!orderLoading}>
					{orderLoading ? (
						<Loader text='Оформляем ваш заказ...' size='large' />
					) : (
						<OrderDetails orderNumber={order!.number} />
					)}
				</Modal>
			)}
		</div>
	);
};

export const App: React.FC = () => {
	return (
		<ErrorBoundary onError={(error, errorInfo) => {
			console.error('App Error:', error, errorInfo);
		}}>
			<BrowserRouter basename="/stellar-burger">
				<AppContent />
			</BrowserRouter>
		</ErrorBoundary>
	);
}; 