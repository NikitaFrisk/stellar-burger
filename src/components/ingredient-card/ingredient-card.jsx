import { CurrencyIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './ingredient-card.module.scss';
import { IngredientType } from '@utils/types';
import PropTypes from 'prop-types';

const IngredientCard = ({ ingredient, onClick }) => {
  return (
    <div className={styles.card} onClick={onClick}>
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
  onClick: PropTypes.func.isRequired
};

export default IngredientCard;
