import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../services/store';
import { getUser } from '../../services/auth/authSlice';
import { ProfileNavigation } from '../../components/profile-navigation/profile-navigation';
import { ProfileForm } from './profile-form';
import { OrderHistoryPage } from '../order-history/order-history';
import { useAuth } from '../../hooks';
import { LoadingSpinner } from '../../components/ui';
import styles from './profile.module.scss';

export const ProfilePage = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { user, loading, isAuthenticated } = useAuth();

	useEffect(() => {
		if (!isAuthenticated) {
			navigate('/login');
			return;
		}

		// Получаем данные пользователя при загрузке компонента
		if (!user) {
			dispatch(getUser());
		}
	}, [dispatch, isAuthenticated, navigate, user]);

	if (loading) {
		return (
			<div className={styles.loading}>
				<LoadingSpinner text="Загрузка профиля..." />
			</div>
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	return (
		<div className={styles.profilePage}>
			<div className={styles.container}>
				<div className={styles.navigation}>
					<ProfileNavigation />
				</div>
				
				<div className={styles.content}>
					<Routes>
						<Route index element={<ProfileForm />} />
						<Route path="orders" element={<OrderHistoryPage />} />
					</Routes>
				</div>
			</div>
		</div>
	);
};
