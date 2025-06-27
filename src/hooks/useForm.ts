import { useState, ChangeEvent } from 'react';

interface UseFormReturn<T> {
	values: T;
	handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
	setValues: (values: T) => void;
}

/**
 * Универсальный хук для управления формами
 * @param {Object} inputValues - начальные значения полей формы
 * @returns {Object} - объект с values, handleChange и setValues
 * 
 * Пример использования:
 * const {values, handleChange, setValues} = useForm({
 *   email: '',
 *   password: ''
 * });
 */
export function useForm<T extends Record<string, any>>(inputValues: T = {} as T): UseFormReturn<T> {
	const [values, setValues] = useState<T>(inputValues);

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { value, name } = event.target;
		setValues({ ...values, [name]: value });
	};

	return { values, handleChange, setValues };
} 