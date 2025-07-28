import styles from './ingredient-details.module.scss';
import { IIngredient } from '@utils/types';

interface IIngredientDetailsProps {
	ingredient: IIngredient;
}

export const IngredientDetails: React.FC<IIngredientDetailsProps> = ({ ingredient }) => {
	return (
		<div className={styles.container} data-testid="ingredient-details">
			<img
				src={ingredient.image_large}
				alt={ingredient.name}
				className={styles.image}
			/>
			<h3 className={styles.name}>{ingredient.name}</h3>
			<div className={styles.nutritionFacts}>
				<div className={styles.nutritionItem}>
					<p className={styles.nutritionLabel}>Калории,ккал</p>
					<p className={styles.nutritionValue}>{ingredient.calories}</p>
				</div>
				<div className={styles.nutritionItem}>
					<p className={styles.nutritionLabel}>Белки, г</p>
					<p className={styles.nutritionValue}>{ingredient.proteins}</p>
				</div>
				<div className={styles.nutritionItem}>
					<p className={styles.nutritionLabel}>Жиры, г</p>
					<p className={styles.nutritionValue}>{ingredient.fat}</p>
				</div>
				<div className={styles.nutritionItem}>
					<p className={styles.nutritionLabel}>Углеводы, г</p>
					<p className={styles.nutritionValue}>{ingredient.carbohydrates}</p>
				</div>
			</div>
		</div>
	);
}; 