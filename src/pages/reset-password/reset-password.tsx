import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../services/store';
import {
	PasswordInput,
	Input,
	Button,
} from '@ya.praktikum/react-developer-burger-ui-components';
import { 
	resetPassword, 
	clearError, 
	selectAuthLoading, 
	selectAuthError,
	selectIsPasswordResetRequested 
} from '../../services/auth/authSlice';
import styles from './reset-password.module.scss';

export const ResetPasswordPage = () => {
	const [formData, setFormData] = useState({
		password: '',
		token: '',
	});

	const [isSuccess, setIsSuccess] = useState(false);
	const [hasSubmitted, setHasSubmitted] = useState(false);

	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const loading = useAppSelector(selectAuthLoading);
	const error = useAppSelector(selectAuthError);
	const isPasswordResetRequested = useAppSelector(selectIsPasswordResetRequested);

	useEffect(() => {
		// Защита от прямого доступа
		// Проверяем либо redux состояние, либо sessionStorage (для случаев после успешного reset)
		const hasResetAccess = isPasswordResetRequested || sessionStorage.getItem('reset-password-access');
		
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
		setHasSubmitted(true);
		dispatch(resetPassword({ password: formData.password, token: formData.token }));
	};

	const isFormValid = formData.password && formData.token;

	if (isSuccess) {
		return (
			<div className={styles.container}>
				<div className={styles.form}>
					<h1 className='text text_type_main-medium mb-6'>
						Пароль успешно изменен
					</h1>
					<p className='text text_type_main-default text_color_inactive'>
						Вы будете перенаправлены на страницу входа через несколько секунд...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<form className={styles.form} onSubmit={handleSubmit}>
				<h1 className='text text_type_main-medium'>
					Восстановление пароля
				</h1>

				{error && (
					<div className={`${styles.error} text text_type_main-default`}>
						{error}
					</div>
				)}

				<div className={styles.inputGroup}>
					<PasswordInput
						onChange={handleInputChange}
						value={formData.password}
						name='password'
						placeholder='Введите новый пароль'
					/>
					<Input
						type='text'
						placeholder='Введите код из письма'
						onChange={handleInputChange}
						value={formData.token}
						name='token'
						error={false}
						errorText=''
						size='default'
					/>
				</div>

				<Button
					htmlType='submit'
					type='primary'
					size='medium'
					extraClass={styles.button}
					disabled={loading || !isFormValid}>
					{loading ? 'Сохраняем...' : 'Сохранить'}
				</Button>

				<div className={styles.links}>
					<p className='text text_type_main-default text_color_inactive'>
						Вспомнили пароль?{' '}
						<Link to='/login' className={styles.link}>
							Войти
						</Link>
					</p>
				</div>
			</form>
		</div>
	);
};
