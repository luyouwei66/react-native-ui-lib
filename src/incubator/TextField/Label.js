function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React, { useContext } from 'react';
import { Colors } from '../../style';
import Text from '../../components/text';
import { ValidationMessagePosition } from './types';
import { getColorByState } from './Presenter';
import FieldContext from './FieldContext';
export default (({
  label,
  labelColor = Colors.grey10,
  labelStyle,
  labelProps,
  validationMessagePosition
}) => {
  const context = useContext(FieldContext);
  const forceHidingLabel = !context.isValid && validationMessagePosition === ValidationMessagePosition.TOP;

  if (label && !forceHidingLabel) {
    return /*#__PURE__*/React.createElement(Text, _extends({
      color: getColorByState(labelColor, context),
      style: labelStyle
    }, labelProps), label);
  }

  return null;
});