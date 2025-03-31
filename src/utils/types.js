import PropTypes from 'prop-types';

export const IngredientType = PropTypes.shape({
  type: PropTypes.oneOf(['bun', 'main', 'sauce']).isRequired,
  carbohydrates: PropTypes.number.isRequired,
  image_mobile: PropTypes.string.isRequired,
  image_large: PropTypes.string.isRequired,
  proteins: PropTypes.number.isRequired,
  calories: PropTypes.number.isRequired,
  price: PropTypes.number.isRequired,
  image: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  _id: PropTypes.string.isRequired,
  fat: PropTypes.number.isRequired,
  __v: PropTypes.number.isRequired,
});