import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import Text from '../../components/text';
import FieldContext from './FieldContext';
export default (({
  validationMessage,
  enableErrors,
  validationMessageStyle,
  retainSpace
}) => {
  const context = useContext(FieldContext);

  if (!enableErrors || !retainSpace && context.isValid) {
    return null;
  }

  return /*#__PURE__*/React.createElement(Text, {
    red30: true,
    style: [styles.validationMessage, validationMessageStyle]
  }, context.isValid ? '' : validationMessage);
});
const styles = StyleSheet.create({
  validationMessage: {
    minHeight: 20
  }
});