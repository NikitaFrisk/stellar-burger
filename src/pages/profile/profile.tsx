import { useState, FormEvent, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../services/store';
import {
	Input,
	EmailInput,
	PasswordInput,
	Button,
} from '@ya.praktikum/react-developer-burger-ui-components';
import { 
	getUser, 
	updateUser, 
	logoutUser,
	clearError,
	selectUser,
	selectAuthLoading,
	selectAuthError,
	selectIsAuthenticated
} from '../../services/auth/authSlice';
import styles from './profile.module.scss';

export const ProfilePage = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const user = useAppSelector(selectUser);
	const loading = useAppSelector(selectAuthLoading);
	const error = useAppSelector(selectAuthError);
	const isAuthenticated = useAppSelector(selectIsAuthenticated);

	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
	});

	const [originalData, setOriginalData] = useState({
		name: '',
		email: '',
	});

	const [hasChanges, setHasChanges] = useState(false);

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

	useEffect(() => {
		if (user) {
			const userData = {
				name: user.name,
				email: user.email,
			};
			setFormData({ ...userData, password: '' });
			setOriginalData(userData);
		}
	}, [user]);

	useEffect(() => {
		const nameChanged = formData.name !== originalData.name;
		const emailChanged = formData.email !== originalData.email;
		const passwordChanged = formData.password !== '';
		
		setHasChanges(nameChanged || emailChanged || passwordChanged);
	}, [formData, originalData]);

	useEffect(() => {
		return () => {
			dispatch(clearError());
		};
	}, [dispatch]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		if (error) {
			dispatch(clearError());
		}
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		
		const updateData: any = {};
		
		if (formData.name !== originalData.name) {
			updateData.name = formData.name;
		}
		
		if (formData.email !== originalData.email) {
			updateData.email = formData.email;
		}
		
		if (formData.password) {
			updateData.password = formData.password;
		}

		if (Object.keys(updateData).length > 0) {
			dispatch(updateUser(updateData));
		}
	};

	const handleCancel = () => {
		if (user) {
			setFormData({
				name: user.name,
				email: user.email,
				password: '',
			});
		}
		dispatch(clearError());
	};

	const handleLogout = () => {
		dispatch(logoutUser());
		navigate('/login');
	};

	if (!user && loading) {
		return (
			<div className={styles.container}>
				<div className={styles.content}>
					<p className='text text_type_main-medium'>Загрузка...</p>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<div className={styles.sidebar}>
				<nav className={styles.navigation}>
					<NavLink
						to='/profile'
						className={({ isActive }) =>
							`${styles.navLink} ${isActive ? styles.active : ''}`
						}
						end>
						<span className='text text_type_main-medium'>Профиль</span>
					</NavLink>
					<NavLink
						to='/profile/orders'
						className={({ isActive }) =>
							`${styles.navLink} ${isActive ? styles.active : ''}`
						}>
						<span className='text text_type_main-medium text_color_inactive'>
							История заказов
						</span>
					</NavLink>
					<button
						className={`${styles.navLink} ${styles.logoutButton}`}
						onClick={handleLogout}>
						<span className='text text_type_main-medium text_color_inactive'>
							Выход
						</span>
					</button>
				</nav>
				<p className={`${styles.description} text text_type_main-default text_color_inactive`}>
					В этом разделе вы можете изменить свои персональные данные
				</p>
			</div>

			<div className={styles.content}>
				<form className={styles.form} onSubmit={handleSubmit}>
					{error && (
						<div className={`${styles.error} text text_type_main-default mb-4`}>
							{error}
						</div>
					)}

					<div className={styles.inputGroup}>
						<Input
							type='text'
							placeholder='Имя'
							onChange={handleInputChange}
							value={formData.name}
							name='name'
							error={false}
							errorText=''
							size='default'
							extraClass='mb-6'
							icon='EditIcon'
						/>
						<EmailInput
							onChange={handleInputChange}
							value={formData.email}
							name='email'
							placeholder='Логин'
							isIcon={true}
							extraClass='mb-6'
						/>
						<PasswordInput
							onChange={handleInputChange}
							value={formData.password}
							name='password'
							placeholder='Пароль'
							icon='EditIcon'
							extraClass='mb-6'
						/>
					</div>

					{hasChanges && (
						<div className={styles.buttons}>
							<Button
								htmlType='button'
								type='secondary'
								size='medium'
								onClick={handleCancel}
								extraClass='mr-3'>
								Отмена
							</Button>
							<Button
								htmlType='submit'
								type='primary'
								size='medium'
								disabled={loading}>
								{loading ? 'Сохраняем...' : 'Сохранить'}
							</Button>
						</div>
					)}
				</form>
			</div>
		</div>
	);
};
