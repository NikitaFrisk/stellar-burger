/**
 * UI константы для устранения дублирования CSS классов
 * Централизованное управление стилями Burger UI компонентов
 */

// Базовые типографические классы
export const UI_TEXT = {
  // Размеры текста
  LARGE: 'text text_type_main-large',
  MEDIUM: 'text text_type_main-medium', 
  DEFAULT: 'text text_type_main-default',
  SMALL: 'text text_type_main-small',
  
  // Размеры цифр
  DIGITS_LARGE: 'text text_type_digits-large',
  DIGITS_MEDIUM: 'text text_type_digits-medium',
  DIGITS_DEFAULT: 'text text_type_digits-default',
} as const;

// Цвета текста
export const UI_TEXT_COLOR = {
  PRIMARY: '', // Основной цвет (по умолчанию)
  INACTIVE: 'text_color_inactive',
  SUCCESS: 'text_color_success',
  ERROR: 'text_color_error',
} as const;

// Комбинированные классы для частого использования
export const UI_COMBINED = {
  // Заголовки
  TITLE_LARGE: UI_TEXT.LARGE,
  TITLE_MEDIUM: UI_TEXT.MEDIUM,
  
  // Основной текст
  TEXT_DEFAULT: UI_TEXT.DEFAULT,
  TEXT_INACTIVE: `${UI_TEXT.DEFAULT} ${UI_TEXT_COLOR.INACTIVE}`,
  TEXT_SUCCESS: `${UI_TEXT.DEFAULT} ${UI_TEXT_COLOR.SUCCESS}`,
  TEXT_ERROR: `${UI_TEXT.DEFAULT} ${UI_TEXT_COLOR.ERROR}`,
  
  // Заголовки с цветами
  TITLE_MEDIUM_INACTIVE: `${UI_TEXT.MEDIUM} ${UI_TEXT_COLOR.INACTIVE}`,
  
  // Цифры
  DIGITS_LARGE: UI_TEXT.DIGITS_LARGE,
  DIGITS_MEDIUM: UI_TEXT.DIGITS_MEDIUM,
  DIGITS_DEFAULT: UI_TEXT.DIGITS_DEFAULT,
} as const;

// Утилитарные функции для построения классов
export const buildClassName = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Функция для добавления дополнительных классов к базовым UI классам  
export const withExtraClasses = (baseClass: string, ...extraClasses: string[]): string => {
  return buildClassName(baseClass, ...extraClasses);
};

// Специфичные комбинации для компонентов
export const COMPONENT_CLASSES = {
  // Для форм аутентификации
  AUTH_FORM: {
    TITLE: UI_COMBINED.TITLE_MEDIUM,
    ERROR: UI_COMBINED.TEXT_ERROR,
    LINK_TEXT: UI_COMBINED.TEXT_INACTIVE,
  },
  
  // Для карточек ингредиентов
  INGREDIENT_CARD: {
    NAME: UI_COMBINED.TEXT_DEFAULT,
    PRICE: UI_TEXT.DIGITS_DEFAULT,
  },
  
  // Для заголовков разделов
  SECTION: {
    TITLE: UI_COMBINED.TITLE_LARGE,
    SUBTITLE: UI_COMBINED.TITLE_MEDIUM,
  },
  
  // Для навигации
  NAVIGATION: {
    LINK_ACTIVE: UI_COMBINED.TITLE_MEDIUM,
    LINK_INACTIVE: UI_COMBINED.TITLE_MEDIUM_INACTIVE,
    DESCRIPTION: UI_COMBINED.TEXT_INACTIVE,
  },
  
  // Для состояний загрузки/ошибок
  STATUS: {
    LOADING: UI_COMBINED.TITLE_MEDIUM,
    ERROR: UI_COMBINED.TEXT_ERROR,
    SUCCESS: UI_COMBINED.TEXT_SUCCESS,
    NOT_FOUND: UI_COMBINED.TITLE_MEDIUM,
  },
} as const; 