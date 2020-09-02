import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import _ from 'lodash';
import Text from '../../components/text';
import FieldContext from './FieldContext';
export default (({
  maxLength,
  charCounterStyle
}) => {
  const {
    value
  } = useContext(FieldContext);

  if (_.isUndefined(maxLength)) {
    return null;
  }

  return /*#__PURE__*/React.createElement(Text, {
    grey30: true,
    style: [styles.container, charCounterStyle]
  }, `${_.size(value)}/${maxLength}`);
});
const styles = StyleSheet.create({
  container: {
    flex: 1,
    textAlign: 'right'
  }
});