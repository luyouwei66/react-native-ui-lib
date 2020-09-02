import React, { createContext } from 'react';
const FieldContext = /*#__PURE__*/createContext({
  isFocused: false,
  hasValue: false,
  isValid: true,
  disabled: false
});
export default FieldContext;