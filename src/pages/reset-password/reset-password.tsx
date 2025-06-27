import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../services/store';
import {
	PasswordInput,
	Input,
} from '@ya.praktikum/react-developer-burger-ui-components';
import { resetPassword, clearError } from '../../services/auth/authSlice';
import { useForm, useAuth } from '../../hooks';
import { AuthForm } from '../../components/auth-form';
import { COMPONENT_CLASSES } from '../../utils/ui-classes';
import styles from './reset-password.module.scss';

export const ResetPasswordPage = () => {
	const { values, handleChange } = useForm({
		password: '',
		token: '',
	});

	const [isSuccess, setIsSuccess] = useState(false);
	const [hasSubmitted, setHasSubmitted] = useState(false);

	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { loading, error, isPasswordResetRequested } = useAuth();

	useEffect(() => {
		// Защита от прямого доступа
		// Проверяем либо redux состояние, либо sessionStorage (для случаев после успешного reset)
		const hasResetAccess =
			isPasswordResetRequested ||
			sessionStorage.getItem('reset-password-access');

		if (!hasResetAccess) {
			navigate('/forgot-password');
			return;
		}

		// Если доступ есть, сохраняем это в sessionStorage на случай перемонтирования
		if (isPasswordResetRequested) {
			sessionStorage.setItem('reset-password-access', 'true');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Намеренно пустой массив - проверяем только при монтировании

	useEffect(() => {
		// Если форма была отправлена и нет ошибки и не загружается, значит успех
		if (hasSubmitted && !loading && !error) {
			setIsSuccess(true);
			const timeoutId = setTimeout(() => {
				// Очищаем доступ перед переходом на логин
				sessionStorage.removeItem('reset-password-access');
				navigate('/login');
			}, 2000);

			return () => clearTimeout(timeoutId);
		}
	}, [hasSubmitted, loading, error, navigate]);

	useEffect(() => {
		return () => {
			dispatch(clearError());
		};
	}, [dispatch]);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		// Очищаем предыдущую ошибку при новой попытке
		if (error) {
			dispatch(clearError());
		}
		setHasSubmitted(true);
		dispatch(
			resetPassword({ password: values.password, token: values.token })
		);
	};

	const isFormValid = Boolean(values.password && values.token);

	if (isSuccess) {
		return (
			<div className={styles.container}>
				<div className={styles.form}>
					<h1 className={`${COMPONENT_CLASSES.STATUS.SUCCESS} mb-6`}>
						Пароль успешно изменен
					</h1>
					<p className={COMPONENT_CLASSES.AUTH_FORM.LINK_TEXT}>
						Вы будете перенаправлены на страницу входа через несколько секунд...
					</p>
				</div>
			</div>
		);
	}

	const links = (
		<p className={COMPONENT_CLASSES.AUTH_FORM.LINK_TEXT}>
			Вспомнили пароль?{' '}
			<Link to='/login' style={{ color: '#4c4cff', textDecoration: 'none' }}>
				Войти
			</Link>
		</p>
	);

	return (
		<AuthForm
			title='Восстановление пароля'
			onSubmit={handleSubmit}
			buttonText='Сохранить'
			loadingText='Сохраняем...'
			isValid={isFormValid}
			links={links}>
			<PasswordInput
				onChange={handleChange}
				value={values.password}
				name='password'
				placeholder='Введите новый пароль'
			/>
			<Input
				type='text'
				placeholder='Введите код из письма'
				onChange={handleChange}
				value={values.token}
				name='token'
				error={false}
				errorText=''
				size='default'
			/>
		</AuthForm>
	);
};
