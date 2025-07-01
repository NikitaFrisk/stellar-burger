import { FormEvent, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../services/store';
import {
	EmailInput,
	PasswordInput,
} from '@ya.praktikum/react-developer-burger-ui-components';
import { login, clearError } from '../../services/auth/authSlice';
import { useForm, useAuth } from '../../hooks';
import { AuthForm } from '../../components/auth-form';
import { COMPONENT_CLASSES } from '../../utils/ui-classes';

export const LoginPage = () => {
	const { values, handleChange } = useForm({
		email: '',
		password: '',
	});

	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const { error, isAuthenticated } = useAuth();

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

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		// Очищаем предыдущую ошибку при новой попытке
		if (error) {
			dispatch(clearError());
		}
		dispatch(login(values));
	};

	const isFormValid = Boolean(values.email && values.password);

	const links = (
		<>
			<p className={COMPONENT_CLASSES.AUTH_FORM.LINK_TEXT}>
				Вы — новый пользователь?{' '}
				<Link to='/register' style={{ color: '#4c4cff', textDecoration: 'none' }}>
					Зарегистрироваться
				</Link>
			</p>
			<p className={COMPONENT_CLASSES.AUTH_FORM.LINK_TEXT}>
				Забыли пароль?{' '}
				<Link to='/forgot-password' style={{ color: '#4c4cff', textDecoration: 'none' }}>
					Восстановить пароль
				</Link>
			</p>
		</>
	);

	return (
		<AuthForm
			title='Вход'
			onSubmit={handleSubmit}
			buttonText='Войти'
			loadingText='Входим...'
			isValid={isFormValid}
			links={links}>
			<EmailInput
				onChange={handleChange}
				value={values.email}
				name='email'
				placeholder='E-mail'
				isIcon={false}
			/>
			<PasswordInput
				onChange={handleChange}
				value={values.password}
				name='password'
				placeholder='Пароль'
			/>
		</AuthForm>
	);
};
