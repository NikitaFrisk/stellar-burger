import React from 'react';
import { CurrencyIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import { IIngredient } from '../../utils/types';
import styles from './order-ingredient-item.module.scss';

interface OrderIngredientItemProps {
  ingredient: IIngredient;
  count: number;
}

export const OrderIngredientItem: React.FC<OrderIngredientItemProps> = ({ 
  ingredient, 
  count 
}) => {
  const totalPrice = ingredient.price * count;

  return (
    <div className={styles.ingredientItem}>
      <div className={styles.ingredientPreview}>
        <div className={styles.illustration}>
          <img 
            src={ingredient.image} 
            alt={ingredient.name}
            className={styles.img}
          />
        </div>
      </div>
      
      <div className={styles.name}>
        {ingredient.name}
      </div>
      
      <div className={styles.priceSection}>
        <div className={styles.countAndPrice}>
          <span className={styles.count}>{count} x {ingredient.price}</span>
        </div>
        
        <div className={styles.price}>
          <span className={styles.priceValue}>{totalPrice}</span>
          <div className={styles.priceIcon}>
            <CurrencyIcon type="primary" />
          </div>
        </div>
      </div>
    </div>
  );
};
