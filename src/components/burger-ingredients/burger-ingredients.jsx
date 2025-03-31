import { Tab, CurrencyIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './burger-ingredients.module.scss';
import { IngredientType } from '@utils/types';
import { useState, useRef } from 'react';
import PropTypes from 'prop-types';

const BurgerIngredients = ({ ingredients }) => {
    const [current, setCurrent] = useState('bun');
    const bgingr = useRef(null);
    const main = useRef(null);
    const bun = useRef(null);

    const handleTabClick = (value) => {
        setCurrent(value);
        const element = value === 'bun'
            ? bun.current
            : value === 'sauce'
                ? bgingr.current
                : main.current;

        element.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className={styles.section}>
            <h1 className={`${styles.title} text text_type_main-large`}>Соберите бургер</h1>

            <div className={styles.tabs}>
                <Tab value="bun" active={current === 'bun'} onClick={handleTabClick}>Булки</Tab>
                <Tab value="sauce" active={current === 'sauce'} onClick={handleTabClick}>Соусы</Tab>
                <Tab value="main" active={current === 'main'} onClick={handleTabClick}>Начинки
                </Tab>
            </div>

            <div className={styles.tabContent}>
                <div className={styles.category}>
                    <h2 ref={bun} className={`${styles.categoryTitle} text text_type_main-medium`}>Булки</h2>
                    <div className={styles.items}>
                        {ingredients
                            .filter(item => item.type === 'bun')
                            .map(item => (
                                <div key={item._id} className={styles.card}>
                                    <img src={item.image} alt={item.name} />
                                    <div className={styles.price}>
                                        <span className="text text_type_digits-default">{item.price}</span>
                                        <CurrencyIcon type="primary" />
                                    </div>
                                    <p className={`${styles.name} text text_type_main-default`}>{item.name}</p>
                                </div>
                            ))}
                    </div>
                </div>

                <div className={styles.category}>
                    <h2 ref={bgingr} className={`${styles.categoryTitle} text text_type_main-medium`}>Соусы</h2>
                    <div className={styles.items}>
                        {ingredients
                            .filter(item => item.type === 'sauce')
                            .map(item => (
                                <div key={item._id} className={styles.card}>
                                    <img src={item.image} alt={item.name} />
                                    <div className={styles.price}>
                                        <span className="text text_type_digits-default">{item.price}</span>
                                        <CurrencyIcon type="primary" />
                                    </div>
                                    <p className={`${styles.name} text text_type_main-default`}>{item.name}</p>
                                </div>
                            ))}
                    </div>
                </div>

                <div className={styles.category}>
                    <h2 ref={main} className={`${styles.categoryTitle} text text_type_main-medium`}>Начинки</h2>
                    <div className={styles.items}>
                        {ingredients
                            .filter(item => item.type === 'main')
                            .map(item => (
                                <div key={item._id} className={styles.card}>
                                    <img src={item.image} alt={item.name} />
                                    <div className={styles.price}>
                                        <span className="text text_type_digits-default">{item.price}</span>
                                        <CurrencyIcon type="primary" />
                                    </div>
                                    <p className={`${styles.name} text text_type_main-default`}>{item.name}</p>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

BurgerIngredients.propTypes = {
    ingredients: PropTypes.arrayOf(IngredientType).isRequired,
};

export default BurgerIngredients;