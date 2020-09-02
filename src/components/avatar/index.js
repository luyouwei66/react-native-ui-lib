import _pt from "prop-types";

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import _ from 'lodash';
import React, { PureComponent } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../style';
import { forwardRef, asBaseComponent } from '../../commons/new';
import { extractAccessibilityProps } from '../../commons/modifiers'; //@ts-ignore

import Badge, { BADGE_SIZES } from '../badge';
import View from '../view';
import Text from '../text';
import Image from '../image'; // @ts-ignore

import AnimatedImage from '../animatedImage';
const deprecatedProps = [{
  old: 'isOnline',
  new: 'badgeProps.backgroundColor'
}, {
  old: 'status',
  new: 'badgeProps.backgroundColor'
}, {
  old: 'imageSource',
  new: 'source'
}];
export let StatusModes;

(function (StatusModes) {
  StatusModes["ONLINE"] = "ONLINE";
  StatusModes["OFFLINE"] = "OFFLINE";
  StatusModes["AWAY"] = "AWAY";
  StatusModes["NONE"] = "NONE";
})(StatusModes || (StatusModes = {}));

;
export let BadgePosition;

(function (BadgePosition) {
  BadgePosition["TOP_RIGHT"] = "TOP_RIGHT";
  BadgePosition["TOP_LEFT"] = "TOP_LEFT";
  BadgePosition["BOTTOM_RIGHT"] = "BOTTOM_RIGHT";
  BadgePosition["BOTTOM_LEFT"] = "BOTTOM_LEFT";
})(BadgePosition || (BadgePosition = {}));

;
const DEFAULT_BADGE_SIZE = 'pimpleBig';

/**
 * @description: Avatar component for displaying user profile images
 * @extends: TouchableOpacity
 * @extendsnotes: (when passing onPress)
 * @extendslink: docs/TouchableOpacity
 * @image: https://user-images.githubusercontent.com/33805983/34480603-197d7f64-efb6-11e7-9feb-db8ba756f055.png
 * @example: https://github.com/wix/react-native-ui-lib/blob/master/demo/src/screens/componentScreens/AvatarsScreen.js
 */
class Avatar extends PureComponent {
  static propTypes = {
    animate: _pt.bool,
    backgroundColor: _pt.string,
    badgePosition: _pt.oneOf(["TOP_RIGHT", "TOP_LEFT", "BOTTOM_RIGHT", "BOTTOM_LEFT"]),
    badgeProps: _pt.object,
    label: _pt.string,
    labelColor: _pt.string,
    ribbonLabel: _pt.string,
    customRibbon: _pt.element,
    isOnline: _pt.bool,
    status: _pt.oneOf(["ONLINE", "OFFLINE", "AWAY", "NONE"]),
    size: _pt.number,
    onPress: _pt.func,
    testID: _pt.string
  };

  constructor(props) {
    super(props);
    this.styles = createStyles(props);
    deprecatedProps.forEach(prop => {
      //@ts-ignore
      if (props[prop.old]) {
        console.warn(`"Avatar's ${prop.old}" property is deprecated, please use "${prop.new}"`);
      }
    });
  }

  static displayName = 'Avatar';
  static modes = StatusModes;
  static badgePosition = BadgePosition;
  static defaultProps = {
    animate: false,
    backgroundColor: Colors.dark80,
    size: 50,
    labelColor: Colors.dark10,
    badgePosition: BadgePosition.TOP_RIGHT
  };

  getContainerStyle() {
    const {
      size
    } = this.props;
    return {
      width: size,
      height: size,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: size / 2
    };
  }

  getInitialsContainer() {
    const {
      size
    } = this.props;
    return { ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: size / 2
    };
  }

  getRibbonStyle() {
    const {
      size
    } = this.props;
    return {
      position: 'absolute',
      top: '10%',
      left: size / 1.7,
      borderRadius: size / 2
    };
  }

  getStatusBadgeColor(status) {
    switch (status) {
      case Avatar.modes.AWAY:
        return Colors.yellow30;

      case Avatar.modes.ONLINE:
        return Colors.green30;

      case Avatar.modes.OFFLINE:
        return Colors.dark60;

      case Avatar.modes.NONE:
      default:
        return null;
    }
  }

  getBadgeBorderWidth = () => _.get(this.props, 'badgeProps.borderWidth', 0);

  getBadgeColor() {
    const {
      isOnline,
      status
    } = this.props;
    const statusColor = this.getStatusBadgeColor(status);
    const onlineColor = isOnline ? Colors.green30 : undefined;
    return _.get(this.props, 'badgeProps.backgroundColor') || statusColor || onlineColor;
  }

  getBadgeSize = () => {
    const badgeSize = _.get(this.props, 'badgeProps.size', DEFAULT_BADGE_SIZE);

    if (_.isString(badgeSize)) {
      return BADGE_SIZES[badgeSize] || BADGE_SIZES[DEFAULT_BADGE_SIZE];
    }

    return badgeSize;
  };

  getBadgePosition() {
    const {
      size,
      badgePosition
    } = this.props;
    const radius = size / 2;
    const x = Math.sqrt(radius ** 2 * 2);
    const y = x - radius;
    const shift = Math.sqrt(y ** 2 / 2) - (this.getBadgeSize() + this.getBadgeBorderWidth() * 2) / 2;

    const badgeLocation = _.split(_.toLower(badgePosition), '_', 2);

    const badgeAlignment = {
      position: 'absolute',
      [badgeLocation[0]]: shift,
      [badgeLocation[1]]: shift
    };
    return badgeAlignment;
  }

  renderBadge() {
    const {
      testID,
      badgeProps
    } = this.props;

    if (badgeProps || this.getBadgeColor()) {
      return /*#__PURE__*/React.createElement(Badge, _extends({
        backgroundColor: this.getBadgeColor(),
        size: this.getBadgeSize()
      }, badgeProps, {
        containerStyle: this.getBadgePosition(),
        label: undefined,
        testID: `${testID}.onlineBadge`
      }));
    }
  }

  renderRibbon() {
    const {
      ribbonLabel,
      ribbonStyle,
      ribbonLabelStyle,
      customRibbon
    } = this.props;

    if (ribbonLabel) {
      return customRibbon ? /*#__PURE__*/React.createElement(View, {
        style: this.getRibbonStyle()
      }, customRibbon) : /*#__PURE__*/React.createElement(View, {
        style: [this.getRibbonStyle(), this.styles.ribbon, ribbonStyle]
      }, /*#__PURE__*/React.createElement(Text, {
        numberOfLines: 1,
        text100: true,
        white: true,
        style: [ribbonLabelStyle]
      }, ribbonLabel));
    }
  }

  renderImage() {
    const {
      animate,
      source,
      // @ts-ignore
      imageSource,
      onImageLoadStart,
      onImageLoadEnd,
      onImageLoadError,
      testID,
      imageProps,
      imageStyle
    } = this.props;
    const hasImage = !_.isUndefined(imageSource) || !_.isUndefined(source);
    const ImageContainer = animate ? AnimatedImage : Image;
    const avatarImageSource = imageSource || source;

    if (hasImage) {
      return /*#__PURE__*/React.createElement(ImageContainer, _extends({
        animate: animate,
        style: [this.getContainerStyle(), StyleSheet.absoluteFillObject, imageStyle],
        source: avatarImageSource,
        onLoadStart: onImageLoadStart,
        onLoadEnd: onImageLoadEnd,
        onError: onImageLoadError,
        testID: `${testID}.image`,
        containerStyle: this.getContainerStyle()
      }, imageProps));
    }
  }

  render() {
    const {
      label,
      labelColor: color,
      source,
      //@ts-ignore
      imageSource,
      backgroundColor,
      onPress,
      containerStyle,
      children,
      size,
      testID,
      //@ts-ignore
      forwardedRef
    } = this.props;
    const Container = onPress ? TouchableOpacity : View;
    const hasImage = !_.isUndefined(imageSource) || !_.isUndefined(source);
    const fontSizeToImageSizeRatio = 0.32;
    const fontSize = size * fontSizeToImageSizeRatio;
    return /*#__PURE__*/React.createElement(Container, _extends({
      style: [this.getContainerStyle(), containerStyle],
      ref: forwardedRef,
      testID: testID,
      onPress: onPress,
      accessible: !_.isUndefined(onPress),
      accessibilityLabel: 'Avatar',
      accessibilityRole: onPress ? 'button' : 'image'
    }, extractAccessibilityProps(this.props)), /*#__PURE__*/React.createElement(View, {
      style: [this.getInitialsContainer(), {
        backgroundColor
      }, hasImage && this.styles.initialsContainerWithInset]
    }, !_.isUndefined(label) && /*#__PURE__*/React.createElement(Text, {
      numberOfLines: 1,
      style: [{
        fontSize
      }, this.styles.initials, {
        color
      }],
      testID: `${testID}.label`
    }, label)), this.renderImage(), this.renderBadge(), this.renderRibbon(), children);
  }

}

function createStyles(props) {
  const {
    labelColor
  } = props;
  const styles = StyleSheet.create({
    initialsContainerWithInset: {
      top: 1,
      right: 1,
      bottom: 1,
      left: 1
    },
    initials: {
      color: labelColor,
      backgroundColor: 'transparent'
    },
    ribbon: {
      backgroundColor: Colors.blue30,
      paddingHorizontal: 6,
      paddingVertical: 3
    }
  });
  return styles;
}

export { Avatar }; // For tests

export default asBaseComponent(forwardRef(Avatar));