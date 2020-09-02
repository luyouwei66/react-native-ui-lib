import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import View from '../view';
import { Animated } from 'react-native';
export default (({
  dialogVisibility,
  modalVisibility,
  overlayBackgroundColor
}) => {
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const animateFading = useCallback(toValue => {
    Animated.timing(fadeAnimation, {
      toValue,
      duration: 400,
      useNativeDriver: true
    }).start();
  }, [fadeAnimation]);
  useEffect(() => {
    if (!dialogVisibility) {
      animateFading(0);
    }
  }, [dialogVisibility, animateFading]);
  useEffect(() => {
    if (modalVisibility) {
      animateFading(1);
    }
  }, [modalVisibility, animateFading]);
  const style = useMemo(() => {
    return {
      opacity: fadeAnimation,
      backgroundColor: overlayBackgroundColor
    };
  }, [overlayBackgroundColor, fadeAnimation]);
  return /*#__PURE__*/React.createElement(View, {
    absF: true,
    animated: true,
    style: style,
    pointerEvents: "none"
  });
});