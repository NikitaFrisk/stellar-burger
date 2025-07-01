import styles from './burger-ingredients.module.scss';
import IngredientCard from '../ingredient-card/ingredient-card';
import { IIngredient } from '@utils/types';
import { RefObject, memo } from 'react';

interface IIngredientCategoryProps {
	title: string;
	ingredients: IIngredient[];
	titleRef?: RefObject<HTMLHeadingElement>;
}

const IngredientCategory: React.FC<IIngredientCategoryProps> = ({ title, ingredients, titleRef }) => {
	return (
		<div className={styles.category}>
			<h2
				ref={titleRef}
				className={`${styles.categoryTitle} text text_type_main-medium`}>
				{title}
			</h2>
			<div className={styles.items}>
				{ingredients.map((item) => (
					<IngredientCard key={item._id} ingredient={item} />
				))}
			</div>
		</div>
	);
};

// Мемоизируем компонент категории
export default memo(IngredientCategory, (prevProps: IIngredientCategoryProps, nextProps: IIngredientCategoryProps) => {
	// Сравниваем заголовок и массив ингредиентов
	if (prevProps.title !== nextProps.title) {
		return false;
	}
	
	// Проверяем изменение количества ингредиентов
	if (prevProps.ingredients.length !== nextProps.ingredients.length) {
		return false;
	}
	
	// Поверхностное сравнение ингредиентов по ID (они иммутабельны)
	return prevProps.ingredients.every((ingredient, index) => 
		ingredient._id === nextProps.ingredients[index]._id
	);
}); 