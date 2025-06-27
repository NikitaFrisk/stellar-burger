import { FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../services/store';
import {
	Input,
	EmailInput,
	PasswordInput,
} from '@ya.praktikum/react-developer-burger-ui-components';
import { register, clearError } from '../../services/auth/authSlice';
import { useForm, useAuth } from '../../hooks';
import { AuthForm } from '../../components/auth-form';
import { COMPONENT_CLASSES } from '../../utils/ui-classes';

export const RegisterPage = () => {
	const { values, handleChange } = useForm({
		name: '',
		email: '',
		password: '',
	});

	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();

	useEffect(() => {
		if (isAuthenticated) {
			navigate('/');
		}
	}, [isAuthenticated, navigate]);

	useEffect(() => {
		return () => {
			dispatch(clearError());
		};
	}, [dispatch]);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		dispatch(register(values));
	};

	const isFormValid = Boolean(values.name && values.email && values.password);

	const links = (
		<p className={COMPONENT_CLASSES.AUTH_FORM.LINK_TEXT}>
			Уже зарегистрированы?{' '}
			<Link to='/login' style={{ color: '#4c4cff', textDecoration: 'none' }}>
				Войти
			</Link>
		</p>
	);

	return (
		<AuthForm
			title='Регистрация'
			onSubmit={handleSubmit}
			buttonText='Зарегистрироваться'
			loadingText='Регистрируемся...'
			isValid={isFormValid}
			links={links}>
			<Input
				type='text'
				placeholder='Имя'
				onChange={handleChange}
				value={values.name}
				name='name'
				error={false}
				errorText=''
				size='default'
			/>
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
