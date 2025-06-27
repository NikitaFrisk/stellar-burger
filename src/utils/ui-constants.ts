/**
 * Константы дизайн-системы для цветов, размеров и других UI параметров
 * Централизованное управление визуальными стилями
 */

export const COLORS = {
	// Основные цвета
	PRIMARY: '#4C4CFF',
	PRIMARY_HOVER: '#3E3EE8',
	PRIMARY_ACTIVE: '#2F2FD1',

	// Текстовые цвета
	TEXT: {
		PRIMARY: '#F2F2F3',
		SECONDARY: '#8585AD',
		INACTIVE: '#4C4C4C',
		ERROR: '#E52B1A',
		SUCCESS: '#00CCCC',
	},

	// Фоновые цвета
	BACKGROUND: {
		PRIMARY: '#131316',
		SECONDARY: '#1C1C21',
		MODAL: '#2F2F37',
		OVERLAY: 'rgba(0, 0, 0, 0.6)',
	},

	// Границы
	BORDER: {
		DEFAULT: '#2F2F37',
		HOVER: '#4C4CFF',
		ACTIVE: '#8585AD',
		ERROR: '#E52B1A',
	},
} as const;

export const SPACING = {
	// Основная сетка (4px base)
	XS: '4px',    // 4px
	SM: '8px',    // 8px
	MD: '16px',   // 16px
	LG: '24px',   // 24px
	XL: '32px',   // 32px
	XXL: '48px',  // 48px

	// Специальные отступы
	CONTAINER: '40px',
	SECTION: '60px',
	MODAL: '30px',
} as const;

export const SIZES = {
	// Размеры иконок
	ICON: {
		SM: '16px',
		MD: '24px',
		LG: '32px',
	},

	// Размеры кнопок
	BUTTON: {
		HEIGHT: {
			SM: '32px',
			MD: '40px',
			LG: '48px',
		},
		PADDING: {
			SM: '8px 16px',
			MD: '12px 24px',
			LG: '16px 32px',
		},
	},

	// Размеры элементов
	CARD: {
		INGREDIENT: '272px',
		MIN_HEIGHT: '208px',
	},

	// Размеры модальных окон
	MODAL: {
		MAX_WIDTH: '720px',
		MIN_HEIGHT: '300px',
	},
} as const;

export const BORDERS = {
	RADIUS: {
		SM: '4px',
		MD: '8px',
		LG: '16px',
		CIRCLE: '50%',
	},

	WIDTH: {
		THIN: '1px',
		THICK: '2px',
	},
} as const;

export const SHADOWS = {
	// Тени для карточек и модальных окон
	CARD: '0 4px 16px rgba(0, 0, 0, 0.16)',
	MODAL: '0 24px 64px rgba(0, 0, 0, 0.24)',
	DROPDOWN: '0 8px 32px rgba(0, 0, 0, 0.32)',
} as const;

export const TRANSITIONS = {
	// Стандартные переходы
	FAST: '0.2s ease',
	NORMAL: '0.3s ease',
	SLOW: '0.5s ease',

	// Easing функции
	EASE_OUT_CUBIC: 'cubic-bezier(0.33, 1, 0.68, 1)',
	EASE_IN_OUT_CUBIC: 'cubic-bezier(0.65, 0, 0.35, 1)',
} as const;

export const Z_INDEX = {
	// Слои наложения
	DROPDOWN: 100,
	TOOLTIP: 200,
	MODAL_OVERLAY: 999,
	MODAL: 1000,
	NOTIFICATION: 1100,
} as const;

export const BREAKPOINTS = {
	// Адаптивные точки останова
	MOBILE: '320px',
	TABLET: '768px',
	DESKTOP: '1024px',
	WIDE: '1440px',
} as const;

/**
 * Утилитарные функции для работы с константами
 */
export const getSpacing = (...values: (keyof typeof SPACING)[]): string => {
	return values.map(value => SPACING[value]).join(' ');
};

export const getPadding = (vertical: keyof typeof SPACING, horizontal: keyof typeof SPACING): string => {
	return `${SPACING[vertical]} ${SPACING[horizontal]}`;
};

export const getTransition = (property: string = 'all', duration: keyof typeof TRANSITIONS = 'NORMAL'): string => {
	return `${property} ${TRANSITIONS[duration]}`;
}; 