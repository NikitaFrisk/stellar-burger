import { CurrencyIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './burger-ingredients.module.scss';
import PropTypes from 'prop-types';
import { IngredientType } from '@utils/types';

const IngredientCard = ({ ingredient }) => {
  return (
    <div className={styles.card}>
      <img src={ingredient.image} alt={ingredient.name} />
      <div className={styles.count}>1</div>
      <div className={styles.price}>
        <span className="text text_type_digits-default">{ingredient.price}</span>
        <CurrencyIcon type="primary" />
      </div>
      <p className={`${styles.name} text text_type_main-default`}>{ingredient.name}</p>
    </div>
  );
};

IngredientCard.propTypes = {
  ingredient: IngredientType.isRequired,
};

export default IngredientCard;