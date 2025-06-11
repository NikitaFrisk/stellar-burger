import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../services/store';
import {
	Input,
	EmailInput,
	PasswordInput,
	Button,
} from '@ya.praktikum/react-developer-burger-ui-components';
import { register, clearError, selectAuthLoading, selectAuthError, selectIsAuthenticated } from '../../services/auth/authSlice';
import styles from './register.module.scss';

export const RegisterPage = () => {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
	});

	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const loading = useAppSelector(selectAuthLoading);
	const error = useAppSelector(selectAuthError);
	const isAuthenticated = useAppSelector(selectIsAuthenticated);

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
		dispatch(register(formData));
	};

	const isFormValid = formData.name && formData.email && formData.password;

	return (
		<div className={styles.container}>
			<form className={styles.form} onSubmit={handleSubmit}>
				<h1 className='text text_type_main-medium'>Регистрация</h1>

				{error && (
					<div className={`${styles.error} text text_type_main-default`}>
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
					/>
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
					disabled={loading || !isFormValid}>
					{loading ? 'Регистрируемся...' : 'Зарегистрироваться'}
				</Button>

				<div className={styles.links}>
					<p className='text text_type_main-default text_color_inactive'>
						Уже зарегистрированы?{' '}
						<Link to='/login' className={styles.link}>
							Войти
						</Link>
					</p>
				</div>
			</form>
		</div>
	);
};
