import styles from './burger-ingredients.module.scss';
import PropTypes from 'prop-types';
import { IngredientType } from '@utils/types';
import IngredientCard from './ingredient-card';

const IngredientCategory = ({ title, ingredients, titleRef }) => {
  return (
    <div className={styles.category}>
      <h2 ref={titleRef} className={`${styles.categoryTitle} text text_type_main-medium`}>{title}</h2>
      <div className={styles.items}>
        {ingredients.map(item => (
          <IngredientCard key={item._id} ingredient={item} />
        ))}
      </div>
    </div>
  );
};

IngredientCategory.propTypes = {
  title: PropTypes.string.isRequired,
  ingredients: PropTypes.arrayOf(IngredientType).isRequired,
  titleRef: PropTypes.object
};

export default IngredientCategory;