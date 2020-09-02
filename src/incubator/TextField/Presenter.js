import { Colors } from './../../style';
import _ from 'lodash';
export function getColorByState(color, context) {
  let finalColor = Colors.grey10;

  if (_.isString(color)) {
    finalColor = color;
  } else if (_.isPlainObject(color)) {
    if (context?.disabled) {
      finalColor = color?.disabled;
    } else if (!context?.isValid) {
      finalColor = color?.error;
    } else if (context?.isFocused) {
      finalColor = color?.focus;
    } else {
      finalColor = color?.default;
    }
  }

  return finalColor;
}