import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
	clearError,
} from '../../services/auth/authSlice';
import { useForm, useAuth } from '../../hooks';
import { LoadingSpinner } from '../../components/ui';
import styles from './profile-form.module.scss';

export const ProfileForm = () => {
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
	};

	if (loading) {
		return (
			<div className={styles.loading}>
				<LoadingSpinner text="Загрузка профиля..." />
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return (
		<div className={styles.profileForm}>
			<form onSubmit={handleSubmit} className={styles.form}>
				<div className={styles.field}>
					<Input
						type="text"
						placeholder="Имя"
						value={values.name}
						name="name"
						error={false}
						onChange={handleChange}
						icon="EditIcon"
						size="default"
					/>
				</div>
				<div className={styles.field}>
					<EmailInput
						value={values.email}
						name="email"
						isIcon={true}
						onChange={handleChange}
					/>
				</div>
				<div className={styles.field}>
					<PasswordInput
						value={values.password}
						name="password"
						icon="EditIcon"
						onChange={handleChange}
					/>
				</div>

				{error && (
					<p className={styles.error}>
						{error}
					</p>
				)}

				{hasChanges && (
					<div className={styles.buttons}>
						<Button 
							htmlType="button" 
							type="secondary" 
							size="medium"
							onClick={handleCancel}
						>
							Отмена
						</Button>
						<Button 
							htmlType="submit" 
							type="primary" 
							size="medium"
							disabled={loading}
						>
							{loading ? 'Сохранение...' : 'Сохранить'}
						</Button>
					</div>
				)}
			</form>
		</div>
	);
};
