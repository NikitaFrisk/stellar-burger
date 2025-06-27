import { FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../services/store';
import { EmailInput } from '@ya.praktikum/react-developer-burger-ui-components';
import { requestPasswordReset, clearError } from '../../services/auth/authSlice';
import { useForm, useAuth } from '../../hooks';
import { AuthForm } from '../../components/auth-form';
import { COMPONENT_CLASSES } from '../../utils/ui-classes';

export const ForgotPasswordPage = () => {
	const { values, handleChange } = useForm({
		email: '',
	});

	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { isPasswordResetRequested } = useAuth();

	useEffect(() => {
		if (isPasswordResetRequested) {
			// Устанавливаем доступ к странице reset-password
			sessionStorage.setItem('reset-password-access', 'true');
			navigate('/reset-password');
		}
	}, [isPasswordResetRequested, navigate]);

	useEffect(() => {
		// Очищаем предыдущий доступ к reset-password при заходе сюда
		sessionStorage.removeItem('reset-password-access');

		return () => {
			dispatch(clearError());
		};
	}, [dispatch]);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		dispatch(requestPasswordReset(values.email));
	};

	const isFormValid = Boolean(values.email);

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
			buttonText='Восстановить'
			loadingText='Отправляем...'
			isValid={isFormValid}
			links={links}>
			<EmailInput
				onChange={handleChange}
				value={values.email}
				name='email'
				placeholder='Укажите e-mail'
				isIcon={false}
			/>
		</AuthForm>
	);
};
