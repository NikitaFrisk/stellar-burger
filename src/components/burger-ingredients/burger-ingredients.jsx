import { Tab } from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './burger-ingredients.module.scss';
import { IngredientType } from '@utils/types';
import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import IngredientCategory from './ingredient-category';

const BurgerIngredients = ({ ingredients }) => {
    const [current, setCurrent] = useState('bun');
    const bunRef = useRef(null);
    const sauceRef = useRef(null);
    const mainRef = useRef(null);

    const handleTabClick = (value) => {
        setCurrent(value);
        const element = value === 'bun'
            ? bunRef.current
            : value === 'sauce'
                ? sauceRef.current
                : mainRef.current;

        element.scrollIntoView({ behavior: 'smooth' });
    };

    const bunIngredients = ingredients.filter(item => item.type === 'bun');
    const sauceIngredients = ingredients.filter(item => item.type === 'sauce');
    const mainIngredients = ingredients.filter(item => item.type === 'main');

    return (
        <section className={styles.section}>
            <h1 className={`${styles.title} text text_type_main-large`}>Соберите бургер</h1>

            <div className={styles.tabs}>
                <Tab value="bun" active={current === 'bun'} onClick={handleTabClick}>Булки</Tab>
                <Tab value="sauce" active={current === 'sauce'} onClick={handleTabClick}>Соусы</Tab>
                <Tab value="main" active={current === 'main'} onClick={handleTabClick}>Начинки</Tab>
            </div>

            <div className={styles.tabContent}>
                <IngredientCategory 
                    title="Булки" 
                    ingredients={bunIngredients} 
                    titleRef={bunRef} 
                />
                <IngredientCategory 
                    title="Соусы" 
                    ingredients={sauceIngredients} 
                    titleRef={sauceRef} 
                />
                <IngredientCategory 
                    title="Начинки" 
                    ingredients={mainIngredients} 
                    titleRef={mainRef} 
                />
            </div>
        </section>
    );
};

BurgerIngredients.propTypes = {
    ingredients: PropTypes.arrayOf(IngredientType).isRequired,
};

export default BurgerIngredients;