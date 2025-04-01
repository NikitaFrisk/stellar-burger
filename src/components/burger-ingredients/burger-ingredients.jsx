import { Tab } from '@ya.praktikum/react-developer-burger-ui-components';
import IngredientCategory from './ingredient-category';
import styles from './burger-ingredients.module.scss';
import { useState, useRef, useEffect } from 'react';
import { IngredientType } from '@utils/types';
import PropTypes from 'prop-types';

const BurgerIngredients = ({ ingredients, onIngredientClick }) => {
    const [current, setCurrent] = useState('bun');
    const sauceRef = useRef(null);
    const mainRef = useRef(null);
    const bunRef = useRef(null);
    const tabContentRef = useRef(null);

    const handleTabClick = (value) => {
        setCurrent(value);
        const element = value === 'bun'
            ? bunRef.current
            : value === 'sauce'
                ? sauceRef.current
                : mainRef.current;

        if (element && tabContentRef.current) {
            const containerTop = tabContentRef.current.getBoundingClientRect().top;
            const elementTop = element.getBoundingClientRect().top;
            tabContentRef.current.scrollTop += elementTop - containerTop;
        }
    };

    useEffect(() => {
        const tabContent = tabContentRef.current;
        if (!tabContent) return;

        const handleScroll = () => {
            if (!bunRef.current || !sauceRef.current || !mainRef.current) return;

            const containerTop = tabContent.getBoundingClientRect().top;
            const bunTop = bunRef.current.getBoundingClientRect().top - containerTop;
            const sauceTop = sauceRef.current.getBoundingClientRect().top - containerTop;
            const mainTop = mainRef.current.getBoundingClientRect().top - containerTop;
            const threshold = 50;

            if (bunTop <= threshold) {
                if (sauceTop <= threshold) {
                    if (mainTop <= threshold) {
                        setCurrent('main');
                    } else {
                        setCurrent('sauce');
                    }
                } else {
                    setCurrent('bun');
                }
            }
        };

        tabContent.addEventListener('scroll', handleScroll);
        return () => tabContent.removeEventListener('scroll', handleScroll);
    }, []);

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

            <div className={styles.tabContent} ref={tabContentRef}>
                <IngredientCategory
                    title="Булки"
                    ingredients={bunIngredients}
                    titleRef={bunRef}
                    onIngredientClick={onIngredientClick}
                />
                <IngredientCategory
                    title="Соусы"
                    ingredients={sauceIngredients}
                    titleRef={sauceRef}
                    onIngredientClick={onIngredientClick}
                />
                <IngredientCategory
                    title="Начинки"
                    ingredients={mainIngredients}
                    titleRef={mainRef}
                    onIngredientClick={onIngredientClick}
                />
            </div>
        </section>
    );
};

BurgerIngredients.propTypes = {
    ingredients: PropTypes.arrayOf(IngredientType).isRequired,
    onIngredientClick: PropTypes.func.isRequired
};

export default BurgerIngredients;