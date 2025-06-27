import { Tab } from '@ya.praktikum/react-developer-burger-ui-components';
import IngredientCategory from './ingredient-category';
import styles from './burger-ingredients.module.scss';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useIngredients } from '../../hooks';
import { LoadingSpinner, ErrorMessage } from '../ui';
import { COMPONENT_CLASSES } from '../../utils/ui-classes';
import { TIngredientType } from '@utils/types';

const BurgerIngredients: React.FC = () => {
	const [current, setCurrent] = useState<TIngredientType>('bun');
	const sauceRef = useRef<HTMLHeadingElement>(null);
	const mainRef = useRef<HTMLHeadingElement>(null);
	const bunRef = useRef<HTMLHeadingElement>(null);
	const tabContentRef = useRef<HTMLDivElement>(null);

	const { ingredients, loading: isLoading, error } = useIngredients();

	// Мемоизируем фильтрацию ингредиентов по типам
	const categorizedIngredients = useMemo(() => ({
		bun: ingredients.filter((item) => item.type === 'bun'),
		sauce: ingredients.filter((item) => item.type === 'sauce'),
		main: ingredients.filter((item) => item.type === 'main'),
	}), [ingredients]);

	const handleTabClick = (value: string) => {
		setCurrent(value as TIngredientType);
		const element =
			value === 'bun'
				? bunRef.current
				: value === 'sauce'
				? sauceRef.current
				: mainRef.current;

		if (element && tabContentRef.current) {
			const containerTop = tabContentRef.current.getBoundingClientRect().top;
			const elementTop = element.getBoundingClientRect().top;
			tabContentRef.current.scrollTop += elementTop - containerTop;
		}
	};

	useEffect(() => {
		const tabContent = tabContentRef.current;
		if (!tabContent) return;

		const handleScroll = () => {
			if (!bunRef.current || !sauceRef.current || !mainRef.current) return;

			const containerTop = tabContent.getBoundingClientRect().top;
			const bunTop = bunRef.current.getBoundingClientRect().top - containerTop;
			const sauceTop =
				sauceRef.current.getBoundingClientRect().top - containerTop;
			const mainTop =
				mainRef.current.getBoundingClientRect().top - containerTop;
			const threshold = 50;

			if (bunTop <= threshold) {
				if (sauceTop <= threshold) {
					if (mainTop <= threshold) {
						setCurrent('main');
					} else {
						setCurrent('sauce');
					}
				} else {
					setCurrent('bun');
				}
			}
		};

		tabContent.addEventListener('scroll', handleScroll);
		return () => tabContent.removeEventListener('scroll', handleScroll);
	}, []);

	if (isLoading) {
		return (
			<div className={styles.section}>
				<LoadingSpinner text="Загрузка ингредиентов..." />
			</div>
		);
	}

	if (error) {
		return (
			<div className={styles.section}>
				<ErrorMessage error={`Произошла ошибка при загрузке ингредиентов: ${error}`} />
			</div>
		);
	}

	return (
		<section className={styles.section}>
			<h1 className={`${styles.title} ${COMPONENT_CLASSES.SECTION.TITLE}`}>
				Соберите бургер
			</h1>
			<div className={styles.tabs}>
				<Tab value='bun' active={current === 'bun'} onClick={handleTabClick}>
					Булки
				</Tab>
				<Tab value='sauce' active={current === 'sauce'} onClick={handleTabClick}>
					Соусы
				</Tab>
				<Tab value='main' active={current === 'main'} onClick={handleTabClick}>
					Начинки
				</Tab>
			</div>
			<div ref={tabContentRef} className={styles.content}>
				<IngredientCategory
					title='Булки'
					ingredients={categorizedIngredients.bun}
					titleRef={bunRef}
				/>
				<IngredientCategory
					title='Соусы'
					ingredients={categorizedIngredients.sauce}
					titleRef={sauceRef}
				/>
				<IngredientCategory
					title='Начинки'
					ingredients={categorizedIngredients.main}
					titleRef={mainRef}
				/>
			</div>
		</section>
	);
};

export default BurgerIngredients; 