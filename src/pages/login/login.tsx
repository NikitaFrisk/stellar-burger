import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../services/store';
import {
	EmailInput,
	PasswordInput,
	Button,
} from '@ya.praktikum/react-developer-burger-ui-components';
import { login, clearError, selectAuthLoading, selectAuthError, selectIsAuthenticated } from '../../services/auth/authSlice';
import styles from './login.module.scss';

export const LoginPage = () => {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});

	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const loading = useAppSelector(selectAuthLoading);
	const error = useAppSelector(selectAuthError);
	const isAuthenticated = useAppSelector(selectIsAuthenticated);

	useEffect(() => {
		if (isAuthenticated) {
			// Возвращаемся туда, откуда пришли, или на главную
			const { from } = location.state || { from: { pathname: '/' } };
			navigate(from.pathname || '/', { replace: true });
		}
	}, [isAuthenticated, navigate, location.state]);

	useEffect(() => {
		// Очищаем ошибки при размонтировании компонента
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
		// Не очищаем ошибку сразу - пользователь должен её увидеть
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		// Очищаем предыдущую ошибку при новой попытке
		if (error) {
			dispatch(clearError());
		}
		dispatch(login(formData));
	};

	return (
		<div className={styles.container}>
			<form className={styles.form} onSubmit={handleSubmit}>
				<h1 className='text text_type_main-medium'>Вход</h1>

				{error && (
					<div className={`${styles.error} text text_type_main-default`}>
						{error}
					</div>
				)}

				<div className={styles.inputGroup}>
					<EmailInput
						onChange={handleInputChange}
						value={formData.email}
						name='email'
						placeholder='E-mail'
						isIcon={false}
					/>
					<PasswordInput
						onChange={handleInputChange}
						value={formData.password}
						name='password'
						placeholder='Пароль'
					/>
				</div>

				<Button
					htmlType='submit'
					type='primary'
					size='medium'
					extraClass={styles.button}
					disabled={loading || !formData.email || !formData.password}>
					{loading ? 'Входим...' : 'Войти'}
				</Button>

				<div className={styles.links}>
					<p className='text text_type_main-default text_color_inactive'>
						Вы — новый пользователь?{' '}
						<Link to='/register' className={styles.link}>
							Зарегистрироваться
						</Link>
					</p>
					<p className='text text_type_main-default text_color_inactive'>
						Забыли пароль?{' '}
						<Link to='/forgot-password' className={styles.link}>
							Восстановить пароль
						</Link>
					</p>
				</div>
			</form>
		</div>
	);
};
