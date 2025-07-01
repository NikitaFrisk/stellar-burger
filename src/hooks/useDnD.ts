import { useDrag, useDrop } from 'react-dnd';
import { 
	TDragItem, 
	IDragCollectedProps, 
	IDropCollectedProps,
	TDndItemType,
	DND_ITEM_TYPES 
} from '../utils/dnd-types';

/**
 * Типизированный хук для drag операций
 */
export const useTypedDrag = (
	type: TDndItemType,
	item: TDragItem,
	canDrag: boolean = true
) => {
	return useDrag({
		type,
		item,
		canDrag,
		collect: (monitor: any): IDragCollectedProps => ({
			isDragging: monitor.isDragging(),
			canDrag: monitor.canDrag(),
		}),
	});
};

/**
 * Типизированный хук для drop операций
 */
export const useTypedDrop = (
	accept: TDndItemType | TDndItemType[],
	onDrop: (item: TDragItem) => void,
	canDrop?: (item: TDragItem) => boolean
) => {
	return useDrop({
		accept,
		drop: onDrop,
		canDrop,
		collect: (monitor: any): IDropCollectedProps => ({
			isOver: monitor.isOver(),
			canDrop: monitor.canDrop(),
		}),
	});
};

/**
 * Специализированный хук для перетаскивания ингредиентов
 */
export const useIngredientDrag = (item: TDragItem) => {
	return useTypedDrag(DND_ITEM_TYPES.INGREDIENT, item);
};

/**
 * Специализированный хук для drop зоны конструктора
 */
export const useConstructorDrop = (onDrop: (item: TDragItem) => void) => {
	return useTypedDrop(DND_ITEM_TYPES.INGREDIENT, onDrop);
};

/**
 * Хук для сортировки внутри конструктора
 */
export const useConstructorSort = (
	item: TDragItem,
	index: number,
	onMove: (dragIndex: number, hoverIndex: number) => void
) => {
	const [, drag] = useDrag({
		type: DND_ITEM_TYPES.CONSTRUCTOR_INGREDIENT,
		item: { ...item, index },
		collect: (monitor: any) => ({
			isDragging: monitor.isDragging(),
		}),
	});

	const [, drop] = useDrop({
		accept: DND_ITEM_TYPES.CONSTRUCTOR_INGREDIENT,
		hover: (draggedItem: TDragItem & { index: number }, monitor: any) => {
			if (!monitor.isOver({ shallow: true })) return;
			
			const dragIndex = draggedItem.index;
			const hoverIndex = index;

			if (dragIndex === hoverIndex) return;

			onMove(dragIndex, hoverIndex);
			draggedItem.index = hoverIndex;
		},
	});

	return { drag, drop };
}; 