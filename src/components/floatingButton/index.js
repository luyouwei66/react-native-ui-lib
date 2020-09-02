import _pt from "prop-types";

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';
import { View as AnimatableView } from 'react-native-animatable';
import { Constants } from '../../helpers';
import { asBaseComponent } from '../../commons/new';
import { Colors, Spacings } from '../../style';
import View from '../view';
import Button from '../button';
import Image from '../image';
const SHOW_ANIMATION_DELAY = 350;
const SHOW_ANIMATION_DURATION = 180;
const HIDE_ANIMATION_DURATION = 150;

const gradientImage = () => require('./gradient.png');
/**
 * @description: Hovering button with gradient background
 * @modifiers: margin, background, color
 * @example: https://github.com/wix/react-native-ui-lib/blob/master/demo/src/screens/componentScreens/FloatingButtonScreen.js
 * @extends: Button
 * @extendsLink: https://github.com/wix/react-native-ui-lib/blob/master/src/components/button/index.js
 */


class FloatingButton extends PureComponent {
  static propTypes = {
    visible: _pt.bool,
    bottomMargin: _pt.number,
    duration: _pt.number,
    withoutAnimation: _pt.bool,
    hideBackgroundOverlay: _pt.bool
  };
  static displayName = 'FloatingButton';

  constructor(props) {
    super(props);
    this.state = {
      shouldAnimateHide: false,
      isVisible: props.visible,
      animating: false
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {
      withoutAnimation
    } = this.props;
    const propsVisible = this.props.visible;
    const nextVisible = nextProps.visible;

    if (!withoutAnimation) {
      const shouldStartAnimation = !this.state.isVisible && nextVisible && !this.state.animating;

      if (shouldStartAnimation) {
        this.setState({
          animating: true
        });

        if (nextProps.duration) {
          setTimeout(() => {
            this.setState({
              isVisible: false,
              shouldAnimateHide: true
            });
          }, nextProps.duration);
        }
      }
    }

    this.setState({
      shouldAnimateHide: withoutAnimation ? false : !nextVisible && propsVisible,
      isVisible: nextVisible
    });
  }

  onAnimationEnd = () => {
    this.setState({
      animating: false
    });
  };

  renderButton() {
    const {
      bottomMargin,
      button,
      secondaryButton
    } = this.props;
    const bottom = secondaryButton ? Spacings.s4 : bottomMargin || Spacings.s8;
    return /*#__PURE__*/React.createElement(Button, _extends({
      size: Button.sizes.large,
      style: [styles.shadow, {
        marginTop: 16,
        marginBottom: bottom
      }]
    }, button));
  }

  renderOverlay = () => {
    if (!this.props.hideBackgroundOverlay) {
      return /*#__PURE__*/React.createElement(View, {
        pointerEvents: 'none',
        style: styles.image
      }, /*#__PURE__*/React.createElement(Image, {
        style: styles.image,
        source: gradientImage(),
        resizeMode: 'stretch'
      }));
    }
  };

  renderSecondaryButton() {
    const {
      secondaryButton,
      bottomMargin
    } = this.props;
    return /*#__PURE__*/React.createElement(Button, _extends({
      link: true,
      size: Button.sizes.large
    }, secondaryButton, {
      style: {
        marginBottom: bottomMargin || Spacings.s7
      },
      enableShadow: false
    }));
  }

  render() {
    const {
      withoutAnimation,
      secondaryButton
    } = this.props;
    const {
      isVisible,
      shouldAnimateHide
    } = this.state;
    const Container = !withoutAnimation ? AnimatableView : View; // NOTE: Don't show if it should not be visible and it was already animated

    if (!isVisible && !shouldAnimateHide) {
      return false;
    }

    return /*#__PURE__*/React.createElement(Container, {
      pointerEvents: "box-none",
      style: [styles.animatedContainer, Constants.isAndroid && {
        zIndex: 99
      }],
      animation: !isVisible ? 'fadeOutDown' : 'fadeInUp',
      duration: SHOW_ANIMATION_DURATION,
      delay: !isVisible ? HIDE_ANIMATION_DURATION : SHOW_ANIMATION_DELAY,
      easing: 'ease-out',
      onAnimationEnd: this.onAnimationEnd
    }, this.renderOverlay(), this.renderButton(), secondaryButton && this.renderSecondaryButton());
  }

}

const styles = StyleSheet.create({
  animatedContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    bottom: 0
  },
  image: { ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%'
  },
  shadow: {
    shadowColor: Colors.dark40,
    shadowOffset: {
      height: 5,
      width: 0
    },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 2
  }
});
export default asBaseComponent(FloatingButton);