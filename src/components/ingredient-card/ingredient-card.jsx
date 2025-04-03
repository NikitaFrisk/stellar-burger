import { CurrencyIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './ingredient-card.module.scss';
import { IngredientType } from '@utils/types';
import PropTypes from 'prop-types';
import { useDrag } from 'react-dnd';
import { useSelector } from 'react-redux';
import { selectBun, selectIngredients } from '../../services/constructor/constructorSlice';

const IngredientCard = ({ ingredient, onClick }) => {
  const constructorIngredients = useSelector(selectIngredients);
  const constructorBun = useSelector(selectBun);
  
  const count = ingredient.type === 'bun'
    ? (constructorBun && constructorBun._id === ingredient._id ? 1 : 0)
    : constructorIngredients.filter(item => item._id === ingredient._id).length;

  const [{ isDragging }, dragRef] = useDrag({
    type: 'ingredient',
    item: ingredient,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  return (
    <div 
      className={styles.card} 
      onClick={onClick}
      ref={dragRef}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <img src={ingredient.image} alt={ingredient.name} />
      {count > 0 && <div className={styles.count}>{count}</div>}
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
