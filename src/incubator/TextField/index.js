import _pt from "prop-types";

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React, { useMemo } from 'react';
import { asBaseComponent, forwardRef } from '../../commons/new';
import View from '../../components/view';
import { ValidationMessagePosition } from './types';
import Input from './Input';
import AccessoryButton from './AccessoryButton';
import ValidationMessage from './ValidationMessage';
import Label from './Label';
import FieldContext from './FieldContext';
import withFieldState from './withFieldState';
import FloatingPlaceholder from './FloatingPlaceholder';
import CharCounter from './CharCounter';

const TextField = ({
  // General
  fieldStyle,
  containerStyle,
  floatingPlaceholder,
  floatingPlaceholderColor,
  floatingPlaceholderStyle,
  hint,
  // Label
  label,
  labelColor,
  labelStyle,
  labelProps,
  // Accessory Buttons
  leadingButton,
  trailingButton,
  // Validation
  enableErrors,
  // TODO: rename to enableValidation
  validationMessage,
  validationMessageStyle,
  validationMessagePosition = ValidationMessagePosition.BOTTOM,
  // Char Counter
  showCharCounter,
  charCounterStyle,
  // Field State
  fieldState,
  // Input
  placeholder,
  ...props
}) => {
  const context = useMemo(() => {
    return { ...fieldState,
      disabled: props.editable === false
    };
  }, [fieldState, props.editable]);
  return /*#__PURE__*/React.createElement(FieldContext.Provider, {
    value: context
  }, /*#__PURE__*/React.createElement(View, {
    style: containerStyle
  }, /*#__PURE__*/React.createElement(Label, {
    label: label,
    labelColor: labelColor,
    labelStyle: labelStyle,
    labelProps: labelProps,
    validationMessagePosition: validationMessagePosition
  }), validationMessagePosition === ValidationMessagePosition.TOP && /*#__PURE__*/React.createElement(ValidationMessage, {
    enableErrors: enableErrors,
    validationMessage: validationMessage,
    validationMessageStyle: validationMessageStyle
  }), /*#__PURE__*/React.createElement(View, {
    style: fieldStyle
  }, /*#__PURE__*/React.createElement(View, {
    row: true,
    centerV: true
  }, leadingButton && /*#__PURE__*/React.createElement(AccessoryButton, leadingButton), /*#__PURE__*/React.createElement(View, {
    flex: true
  }, floatingPlaceholder && /*#__PURE__*/React.createElement(FloatingPlaceholder, {
    placeholder: placeholder,
    floatingPlaceholderStyle: floatingPlaceholderStyle,
    floatingPlaceholderColor: floatingPlaceholderColor
  }), /*#__PURE__*/React.createElement(Input, _extends({}, props, {
    placeholder: floatingPlaceholder ? undefined : placeholder,
    hint: hint
  }))), trailingButton && /*#__PURE__*/React.createElement(AccessoryButton, trailingButton))), /*#__PURE__*/React.createElement(View, {
    row: true,
    spread: true
  }, validationMessagePosition === ValidationMessagePosition.BOTTOM && /*#__PURE__*/React.createElement(ValidationMessage, {
    enableErrors: enableErrors,
    validationMessage: validationMessage,
    validationMessageStyle: validationMessageStyle,
    retainSpace: true
  }), showCharCounter && /*#__PURE__*/React.createElement(CharCounter, {
    maxLength: props.maxLength,
    charCounterStyle: charCounterStyle
  }))));
};

TextField.propTypes = {
  floatingPlaceholder: _pt.bool
};
TextField.displayName = 'Incubator.TextField';
TextField.validationMessagePositions = ValidationMessagePosition;
export default asBaseComponent(forwardRef(withFieldState(TextField)));