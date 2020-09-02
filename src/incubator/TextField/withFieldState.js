import _pt from "prop-types";

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React, { useCallback, useState, useEffect, useMemo } from 'react';
import _ from 'lodash'; //@ts-ignore

import hoistStatics from 'hoist-non-react-statics';
import validators from './validators';

function withFieldState(WrappedComponent) {
  const WithFieldState = ({
    validate,
    validateOnBlur,
    validateOnChange,
    validateOnStart,
    ...props
  }) => {
    const [value, setValue] = useState(props.value);
    const [isFocused, setIsFocused] = useState(false);
    const [isValid, setIsValid] = useState(true);
    useEffect(() => {
      if (validateOnStart) {
        validateField();
      }
    }, []);
    const validateField = useCallback((valueToValidate = value) => {
      let _isValid = true;

      if (_.isFunction(validate)) {
        _isValid = validate(valueToValidate);
      } else if (_.isString(validate)) {
        _isValid = _.invoke(validators, validate, valueToValidate);
      }

      setIsValid(_isValid);
    }, [value]);
    const onFocus = useCallback((...args) => {
      setIsFocused(true);

      _.invoke(props, 'onFocus', ...args);
    }, [props.onFocus]);
    const onBlur = useCallback((...args) => {
      setIsFocused(false);

      _.invoke(props, 'onBlur', ...args);

      if (validateOnBlur) {
        validateField();
      }
    }, [props.onBlur, validateOnBlur, validateField]);
    const onChangeText = useCallback(text => {
      setValue(text);

      _.invoke(props, 'onChangeText', text);

      if (validateOnChange) {
        validateField(text);
      }
    }, [props.onChangeText, validateOnChange]);
    const fieldState = useMemo(() => {
      return {
        value,
        hasValue: !_.isEmpty(value),
        isValid,
        isFocused
      };
    }, [value, isFocused, isValid]);
    return /*#__PURE__*/React.createElement(WrappedComponent, _extends({}, props, {
      onFocus: onFocus,
      onBlur: onBlur,
      onChangeText: onChangeText,
      fieldState: fieldState
    }));
  };

  WithFieldState.propTypes = {
    validateOnStart: _pt.bool,
    validateOnChange: _pt.bool,
    validateOnBlur: _pt.bool
  };
  hoistStatics(WithFieldState, WrappedComponent);
  WithFieldState.displayName = WrappedComponent.displayName;
  return WithFieldState;
}

export default withFieldState;