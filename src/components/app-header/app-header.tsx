import {
	BurgerIcon,
	ListIcon,
	ProfileIcon,
	Logo,
} from '@ya.praktikum/react-developer-burger-ui-components';
import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../services/store';
import {
	getUser,
	selectUser,
	selectIsAuthenticated,
} from '../../services/auth/authSlice';
import { getCookie } from '../../utils/cookie';
import { UI_COMBINED } from '../../utils/ui-classes';
import styles from './app-header.module.scss';

export const AppHeader: React.FC = () => {
	const location = useLocation();
	const dispatch = useAppDispatch();
	const user = useAppSelector(selectUser);
	const isAuthenticated = useAppSelector(selectIsAuthenticated);

	useEffect(() => {
		// Проверяем, есть ли токены при загрузке
		const refreshToken = getCookie('refreshToken');
		const accessToken = localStorage.getItem('accessToken');

		if (refreshToken && accessToken && !user) {
			dispatch(getUser());
		}
	}, [dispatch, user]);

	const getIconType = (path: string, currentPath: string): 'primary' | 'secondary' => {
		return currentPath === path || currentPath.startsWith(path + '/')
			? 'primary'
			: 'secondary';
	};

	const getLinkClass = (path: string, currentPath: string): string => {
		const isActive = currentPath === path || currentPath.startsWith(path + '/');
		return `${styles.link} ${isActive ? styles.active : ''}`;
	};

	return (
		<header className={styles.header}>
			<div className={styles.navBar}>
				<div className={`${styles.navGroup} ${styles.leftNav}`}>
					<NavLink
						to='/'
						className={({ isActive }) =>
							`${styles.link} ${isActive ? styles.active : ''}`
						}>
						<BurgerIcon type={getIconType('/', location.pathname)} />
						<span className={`${UI_COMBINED.TEXT_DEFAULT} ml-2`}>
							Конструктор
						</span>
					</NavLink>
					<NavLink
						to='/feed'
						className={({ isActive }) =>
							getLinkClass('/feed', location.pathname)
						}>
						<ListIcon type={getIconType('/feed', location.pathname)} />
						<span className={`${UI_COMBINED.TEXT_DEFAULT} ml-2`}>
							Лента заказов
						</span>
					</NavLink>
				</div>

				<div className={styles.logo}>
					<NavLink to='/'>
						<Logo />
					</NavLink>
				</div>

				<div className={`${styles.navGroup} ${styles.rightNav}`}>
					<NavLink
						to='/profile'
						className={({ isActive }) =>
							getLinkClass('/profile', location.pathname)
						}>
						<ProfileIcon type={getIconType('/profile', location.pathname)} />
						<span className={`${UI_COMBINED.TEXT_DEFAULT} ml-2`}>
							{isAuthenticated && user ? user.name : 'Личный кабинет'}
						</span>
					</NavLink>
				</div>
			</div>
		</header>
	);
}; 