import { IIngredient, IConstructorIngredient } from './types';

/**
 * Типы для Drag and Drop функциональности
 */

// Типы элементов для перетаскивания
export const DND_ITEM_TYPES = {
	INGREDIENT: 'ingredient',
	CONSTRUCTOR_INGREDIENT: 'constructor-ingredient',
} as const;

export type TDndItemType = typeof DND_ITEM_TYPES[keyof typeof DND_ITEM_TYPES];

// Интерфейс для drag item из списка ингредиентов
export interface IDragItem {
	type: typeof DND_ITEM_TYPES.INGREDIENT;
	ingredient: IIngredient;
}

// Интерфейс для drag item из конструктора (для сортировки)
export interface IConstructorDragItem {
	type: typeof DND_ITEM_TYPES.CONSTRUCTOR_INGREDIENT;
	ingredient: IConstructorIngredient;
	index: number;
}

// Union тип для всех drag items
export type TDragItem = IDragItem | IConstructorDragItem;

// Интерфейс для drop результата
export interface IDropResult {
	dropEffect: string;
	name?: string;
}

// Интерфейс для collected props в useDrag
export interface IDragCollectedProps {
	isDragging: boolean;
	canDrag: boolean;
}

// Интерфейс для collected props в useDrop
export interface IDropCollectedProps {
	isOver: boolean;
	canDrop: boolean;
}

// Интерфейс для hover monitoring в сортировке
export interface IHoverMonitor {
	isOver: () => boolean;
	getDropResult: () => IDropResult | null;
	getClientOffset: () => { x: number; y: number } | null;
}

// Типы для обработчиков DnD событий
export type TDragStartHandler = (item: TDragItem) => void;
export type TDragEndHandler = (item: TDragItem, monitor: any) => void;
export type TDropHandler = (item: TDragItem) => void;
export type THoverHandler = (item: TDragItem, monitor: IHoverMonitor) => void;

// Конфигурация для useDrag hook
export interface IDragConfig {
	type: TDndItemType;
	item: TDragItem;
	canDrag?: boolean;
	collect: (monitor: any) => IDragCollectedProps;
	end?: TDragEndHandler;
}

// Конфигурация для useDrop hook
export interface IDropConfig {
	accept: TDndItemType | TDndItemType[];
	canDrop?: (item: TDragItem) => boolean;
	drop?: TDropHandler;
	hover?: THoverHandler;
	collect: (monitor: any) => IDropCollectedProps;
}

// Утилитарные типы для типизации refs
export type TDragRef = React.RefObject<HTMLDivElement>;
export type TDropRef = React.RefObject<HTMLDivElement>;

// Интерфейс для позиционирования при hover
export interface IHoverPosition {
	clientY: number;
	hoverBoundingRect: DOMRect;
	hoverMiddleY: number;
}

// Результат проверки hover направления
export interface IHoverDirection {
	shouldMoveUp: boolean;
	shouldMoveDown: boolean;
} 