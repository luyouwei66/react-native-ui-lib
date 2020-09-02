import _pt from "prop-types";

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import _ from 'lodash';
import React, { PureComponent } from 'react';
import { StyleSheet, Animated, Easing } from 'react-native';
import { Colors, Typography } from '../../style';
import { asBaseComponent } from '../../commons/new';
import Image from '../image';
import TouchableOpacity from '../touchableOpacity';
import View from '../view';
import Text from '../text'; // @ts-ignore

import Badge from '../badge';
const INDICATOR_BG_COLOR = Colors.blue30;
const INDICATOR_HEIGHT = 2;
const INDICATOR_SPACINGS = 16;
/**
 * @description: TabBar.Item, inner component of TabBar for configuring the tabs
 * @example: https://github.com/wix/react-native-ui-lib/blob/master/demo/src/screens/componentScreens/TabBarScreen.js
 * @extends: TouchableOpacity
 * @extendsLink: https://facebook.github.io/react-native/docs/touchableopacity
 */

class TabBarItem extends PureComponent {
  static propTypes = {
    icon: _pt.number,
    iconColor: _pt.string,
    iconSelectedColor: _pt.string,
    label: _pt.string,
    maxLines: _pt.number,
    selected: _pt.bool,
    showDivider: _pt.bool,
    width: _pt.number,
    ignore: _pt.bool,
    onPress: _pt.func,
    uppercase: _pt.bool,
    activeBackgroundColor: _pt.string,
    testID: _pt.string
  };
  static displayName = 'TabBar.Item';
  static defaultProps = {
    test: true,
    // this will enable by the new tab bar design
    maxLines: 1
  };

  constructor(props) {
    super(props);
    this.state = {
      indicatorOpacity: props.selected ? new Animated.Value(1) : new Animated.Value(0)
    };
  }

  styles = createStyles();
  layout = undefined;

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.selected !== nextProps.selected) {
      this.animate(nextProps.selected);
    }
  }

  animate(newValue) {
    if (this.state.indicatorOpacity) {
      Animated.timing(this.state.indicatorOpacity, {
        toValue: newValue ? 1 : 0,
        easing: Easing.ease,
        duration: 150,
        useNativeDriver: true
      }).start();
    }
  }

  getFlattenStyle(style) {
    return StyleSheet.flatten(style);
  }

  getStylePropValue(flattenStyle, propName) {
    let prop;

    if (flattenStyle) {
      const propObject = _.pick(flattenStyle, [propName]);

      prop = propObject[propName];
    }

    return prop;
  }

  getColorFromStyle(style) {
    const flattenStyle = this.getFlattenStyle(style);
    return this.getStylePropValue(flattenStyle, 'color');
  }

  getLayout() {
    return this.layout;
  }

  onLayout = event => {
    this.layout = event.nativeEvent.layout;
  };

  render() {
    const {
      indicatorOpacity
    } = this.state;
    const {
      children,
      indicatorStyle,
      icon,
      iconColor,
      iconSelectedColor,
      label,
      labelStyle,
      badge,
      uppercase,
      maxLines,
      selected,
      selectedLabelStyle,
      showDivider,
      width,
      onPress,
      activeBackgroundColor,
      style,
      testID
    } = this.props;
    const iconTint = iconColor || this.getColorFromStyle(labelStyle) || this.getColorFromStyle(this.styles.label);
    const iconSelectedTint = iconSelectedColor || this.getColorFromStyle(selectedLabelStyle) || this.getColorFromStyle(this.styles.selectedLabel);
    return /*#__PURE__*/React.createElement(TouchableOpacity, {
      activeOpacity: 1,
      onPress: onPress,
      style: [style, width ? {
        width
      } : {
        flex: 1
      }],
      testID: testID,
      activeBackgroundColor: activeBackgroundColor,
      onLayout: this.onLayout,
      accessibilityStates: selected ? ['selected'] : []
    }, /*#__PURE__*/React.createElement(View, {
      row: true,
      flex: true,
      center: true,
      style: [showDivider && this.styles.divider, {
        paddingHorizontal: 16
      }]
    }, icon && /*#__PURE__*/React.createElement(Image, {
      style: !_.isEmpty(label) && {
        marginRight: 6
      },
      source: icon,
      tintColor: selected ? iconSelectedTint : iconTint
    }), !_.isEmpty(label) && /*#__PURE__*/React.createElement(Text, {
      numberOfLines: maxLines,
      uppercase: uppercase,
      style: [labelStyle || this.styles.label, selected && (selectedLabelStyle || this.styles.selectedLabel)],
      accessibilityLabel: `${label} tab`
    }, label), children, badge && /*#__PURE__*/React.createElement(Badge, _extends({
      backgroundColor: Colors.red30,
      size: 'small'
    }, badge, {
      containerStyle: [this.styles.badge, badge.containerStyle]
    }))), /*#__PURE__*/React.createElement(Animated.View, {
      style: [{
        opacity: indicatorOpacity
      }, this.styles.indicator, indicatorStyle]
    }));
  }

}

function createStyles() {
  return StyleSheet.create({
    label: {
      color: Colors.dark30,
      ...Typography.text80
    },
    selectedLabel: {
      color: Colors.blue30,
      ...Typography.text80,
      fontWeight: 'bold'
    },
    divider: {
      borderRightWidth: 1,
      borderRightColor: Colors.dark70,
      marginVertical: 14 // NOTE: will not cut long text at the top and bottom in iOS if TabBar not high enough

    },
    indicator: {
      backgroundColor: INDICATOR_BG_COLOR,
      height: INDICATOR_HEIGHT,
      marginHorizontal: INDICATOR_SPACINGS
    },
    badge: {
      marginLeft: 4
    }
  });
}

export default asBaseComponent(TabBarItem);