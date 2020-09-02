import _pt from "prop-types";

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React, { useContext } from 'react';
import { TextInput, StyleSheet, Platform } from 'react-native';
import { Constants } from '../../helpers';
import FieldContext from './FieldContext';

const Input = ({
  style,
  hint,
  forwardedRef,
  ...props
}) => {
  const context = useContext(FieldContext);
  const placeholder = !context.isFocused ? props.placeholder : hint || props.placeholder;
  return /*#__PURE__*/React.createElement(TextInput, _extends({
    style: [styles.input, style]
  }, props, {
    placeholder: placeholder,
    ref: forwardedRef,
    underlineColorAndroid: "transparent",
    accessibilityState: {
      disabled: props.editable === false
    }
  }));
};

Input.propTypes = {
  hint: _pt.string
};
export default Input;
const styles = StyleSheet.create({
  input: {
    textAlign: Constants.isRTL ? 'right' : 'left',
    // Setting paddingTop/Bottom separately fix height issues on iOS with multiline
    paddingTop: 0,
    paddingBottom: 0,
    ...Platform.select({
      // This reset android input inner spacing
      android: {
        padding: 0,
        textAlignVertical: 'center'
      }
    })
  }
});