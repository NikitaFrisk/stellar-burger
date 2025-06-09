import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../services/store';
import {
	EmailInput,
	Button,
} from '@ya.praktikum/react-developer-burger-ui-components';
import { 
	requestPasswordReset, 
	clearError, 
	selectAuthLoading, 
	selectAuthError, 
	selectIsPasswordResetRequested 
} from '../../services/auth/authSlice';
import styles from './forgot-password.module.scss';

export const ForgotPasswordPage = () => {
	const [email, setEmail] = useState('');

	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const loading = useAppSelector(selectAuthLoading);
	const error = useAppSelector(selectAuthError);
	const isPasswordResetRequested = useAppSelector(selectIsPasswordResetRequested);

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

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value);
		if (error) {
			dispatch(clearError());
		}
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		dispatch(requestPasswordReset(email));
	};

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
					<EmailInput
						onChange={handleInputChange}
						value={email}
						name='email'
						placeholder='Укажите e-mail'
						isIcon={false}
					/>
				</div>

				<Button
					htmlType='submit'
					type='primary'
					size='medium'
					extraClass={styles.button}
					disabled={loading || !email}>
					{loading ? 'Отправляем...' : 'Восстановить'}
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
