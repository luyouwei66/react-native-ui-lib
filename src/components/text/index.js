import _pt from "prop-types";

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React, { PureComponent } from 'react';
import { Text as RNText, StyleSheet, Animated } from 'react-native';
import { asBaseComponent, forwardRef } from '../../commons/new';
import { Colors } from '../../style';
import _ from 'lodash';

/**
 * @description: A wrapper for Text component with extra functionality like modifiers support
 * @extends: Text
 * @extendslink: https://facebook.github.io/react-native/docs/text.html
 * @modifiers: margins, color, typography
 */
class Text extends PureComponent {
  static propTypes = {
    color: _pt.string,
    center: _pt.bool,
    uppercase: _pt.bool,
    highlightString: _pt.string,
    animated: _pt.bool,
    textAlign: _pt.string
  };
  static displayName = 'Text';
  TextContainer = this.props.animated ? Animated.createAnimatedComponent(RNText) : RNText; // setNativeProps(nativeProps) {
  //   this._root.setNativeProps(nativeProps); // eslint-disable-line
  // }

  getTextPartsByHighlight(targetString = '', highlightString = '') {
    if (_.isEmpty(highlightString.trim())) {
      return [targetString];
    }

    const textParts = [];
    let highlightIndex;

    do {
      highlightIndex = _.lowerCase(targetString).indexOf(_.lowerCase(highlightString));

      if (highlightIndex !== -1) {
        if (highlightIndex > 0) {
          textParts.push(targetString.substring(0, highlightIndex));
        }

        textParts.push(targetString.substr(highlightIndex, highlightString.length));
        targetString = targetString.substr(highlightIndex + highlightString.length);
      } else {
        textParts.push(targetString);
      }
    } while (highlightIndex !== -1);

    return textParts;
  }

  renderText(children) {
    const {
      highlightString,
      highlightStyle
    } = this.props;

    if (!_.isEmpty(highlightString)) {
      if (_.isArray(children)) {
        return _.map(children, child => {
          return this.renderText(child);
        });
      }

      if (_.isString(children)) {
        const textParts = this.getTextPartsByHighlight(children, highlightString);
        return _.map(textParts, (text, index) => {
          const shouldHighlight = _.lowerCase(text) === _.lowerCase(highlightString);

          return /*#__PURE__*/React.createElement(RNText, {
            key: index,
            style: shouldHighlight ? [styles.highlight, highlightStyle] : styles.notHighlight
          }, text);
        });
      }
    }

    return children;
  }

  render() {
    const {
      modifiers,
      style,
      center,
      uppercase,
      children,
      forwardedRef,
      ...others
    } = this.props;
    const color = this.props.color || modifiers.color;
    const {
      margins,
      typography,
      backgroundColor,
      flexStyle
    } = modifiers;
    const textStyle = [styles.container, typography, color && {
      color
    }, backgroundColor && {
      backgroundColor
    }, flexStyle, margins, center && styles.centered, uppercase && styles.uppercase, style];
    const TextContainer = this.TextContainer;
    return /*#__PURE__*/React.createElement(TextContainer, _extends({}, others, {
      style: textStyle,
      ref: forwardedRef
    }), this.renderText(children));
  }

}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    textAlign: 'left'
  },
  centered: {
    textAlign: 'center'
  },
  uppercase: {
    textTransform: 'uppercase'
  },
  highlight: {
    color: Colors.grey30
  },
  notHighlight: {
    color: undefined
  }
});
export { Text }; // For tests

export default asBaseComponent(forwardRef(Text));