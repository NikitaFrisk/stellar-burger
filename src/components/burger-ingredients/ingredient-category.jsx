import styles from './burger-ingredients.module.scss';
import IngredientCard from '../ingredient-card/ingredient-card';
import { IngredientType } from '@utils/types';
import PropTypes from 'prop-types';

const IngredientCategory = ({ title, ingredients, titleRef, onIngredientClick }) => {
  return (
    <div className={styles.category}>
      <h2 ref={titleRef} className={`${styles.categoryTitle} text text_type_main-medium`}>{title}</h2>
      <div className={styles.items}>
        {ingredients.map(item => (
          <IngredientCard
            key={item._id}
            ingredient={item}
            onClick={() => onIngredientClick(item)}
          />
        ))}
      </div>
    </div>
  );
};

IngredientCategory.propTypes = {
  title: PropTypes.string.isRequired,
  ingredients: PropTypes.arrayOf(IngredientType).isRequired,
  titleRef: PropTypes.object,
  onIngredientClick: PropTypes.func.isRequired
};

export default IngredientCategory;