import { Tab } from '@ya.praktikum/react-developer-burger-ui-components';
import IngredientCategory from './ingredient-category';
import styles from './burger-ingredients.module.scss';
import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIngredients, selectIngredientsLoading, selectIngredientsError } from '../../services/ingredients/ingredientsSlice';
import { setCurrentIngredient } from '../../services/ingredient-details/ingredientDetailsSlice';

const BurgerIngredients = () => {
    const [current, setCurrent] = useState('bun');
    const sauceRef = useRef(null);
    const mainRef = useRef(null);
    const bunRef = useRef(null);
    const tabContentRef = useRef(null);

    const dispatch = useDispatch();
    const ingredients = useSelector(selectIngredients);
    const isLoading = useSelector(selectIngredientsLoading);
    const error = useSelector(selectIngredientsError);

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

    const handleIngredientClick = (ingredient) => {
        dispatch(setCurrentIngredient(ingredient));
    };

    if (isLoading) {
        return <div className={styles.section}>Загрузка ингредиентов...</div>;
    }

    if (error) {
        return <div className={styles.section}>Произошла ошибка при загрузке ингредиентов: {error}</div>;
    }

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
                    onIngredientClick={handleIngredientClick}
                />
                <IngredientCategory
                    title="Соусы"
                    ingredients={sauceIngredients}
                    titleRef={sauceRef}
                    onIngredientClick={handleIngredientClick}
                />
                <IngredientCategory
                    title="Начинки"
                    ingredients={mainIngredients}
                    titleRef={mainRef}
                    onIngredientClick={handleIngredientClick}
                />
            </div>
        </section>
    );
};

export default BurgerIngredients;