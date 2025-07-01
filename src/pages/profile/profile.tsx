import { useState, FormEvent, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../services/store';
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
} from '../../services/auth/authSlice';
import { useForm, useAuth } from '../../hooks';
import { COMPONENT_CLASSES } from '../../utils/ui-classes';
import { LoadingSpinner } from '../../components/ui';
import styles from './profile.module.scss';

export const ProfilePage = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { user, loading, error, isAuthenticated } = useAuth();

	const { values, handleChange, setValues } = useForm({
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
			setValues({ ...userData, password: '' });
			setOriginalData(userData);
		}
	}, [user, setValues]);

	useEffect(() => {
		const nameChanged = values.name !== originalData.name;
		const emailChanged = values.email !== originalData.email;
		const passwordChanged = values.password !== '';

		setHasChanges(nameChanged || emailChanged || passwordChanged);
	}, [values, originalData]);

	useEffect(() => {
		return () => {
			dispatch(clearError());
		};
	}, [dispatch]);

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const updateData: { name?: string; email?: string; password?: string } = {};

		if (values.name !== originalData.name) {
			updateData.name = values.name;
		}

		if (values.email !== originalData.email) {
			updateData.email = values.email;
		}

		if (values.password) {
			updateData.password = values.password;
		}

		if (Object.keys(updateData).length > 0) {
			dispatch(updateUser(updateData));
		}
	};

	const handleCancel = () => {
		if (user) {
			setValues({
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
					<LoadingSpinner text="Загрузка профиля..." />
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
						<span className={COMPONENT_CLASSES.NAVIGATION.LINK_ACTIVE}>Профиль</span>
					</NavLink>
					<NavLink
						to='/profile/orders'
						className={({ isActive }) =>
							`${styles.navLink} ${isActive ? styles.active : ''}`
						}>
						<span className={COMPONENT_CLASSES.NAVIGATION.LINK_INACTIVE}>
							История заказов
						</span>
					</NavLink>
					<button
						className={`${styles.navLink} ${styles.logoutButton}`}
						onClick={handleLogout}>
						<span className={COMPONENT_CLASSES.NAVIGATION.LINK_INACTIVE}>
							Выход
						</span>
					</button>
				</nav>
				<p
					className={`${styles.description} ${COMPONENT_CLASSES.NAVIGATION.DESCRIPTION}`}>
					В этом разделе вы можете изменить свои персональные данные
				</p>
			</div>

			<div className={styles.content}>
				<form className={styles.form} onSubmit={handleSubmit}>
					{error && (
						<div className={`${styles.error} ${COMPONENT_CLASSES.STATUS.ERROR} mb-4`}>
							{error}
						</div>
					)}

					<div className={styles.inputGroup}>
						<Input
							type='text'
							placeholder='Имя'
							onChange={handleChange}
							value={values.name}
							name='name'
							error={false}
							errorText=''
							size='default'
							extraClass='mb-6'
							icon='EditIcon'
						/>
						<EmailInput
							onChange={handleChange}
							value={values.email}
							name='email'
							placeholder='Логин'
							isIcon={true}
							extraClass='mb-6'
						/>
						<PasswordInput
							onChange={handleChange}
							value={values.password}
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
