function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React, { useState, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import forwardRef from './forwardRef'; //@ts-ignore

import hoistStatics from 'hoist-non-react-statics';
import { Constants } from '../helpers';
const DEFAULT_THRESHOLD = Constants.isAndroid ? 1 : 0;
/**
 * @description: Add scroll reached which notifies on reaching start \ end of ScrollView \ FlatList
 * @example: https://github.com/wix/react-native-ui-lib/blob/master/demo/src/screens/componentScreens/WithScrollReachedScreen.tsx
 * @notes: Send `props.scrollReachedProps.onScroll` to your onScroll and receive via props.scrollReachedProps.isScrollAtStart props.scrollReachedProps.isScrollAtEnd
 */

function withScrollReached(WrappedComponent, options = {}) {
  const ScrollReachedDetector = props => {
    // The scroll starts at the start, from what I've tested this works fine
    const [isScrollAtStart, setScrollAtStart] = useState(true);
    const [isScrollAtEnd, setScrollAtEnd] = useState(false);
    const onScroll = useCallback(event => {
      const {
        nativeEvent: {
          layoutMeasurement: {
            width: layoutWidth,
            height: layoutHeight
          },
          contentOffset: {
            x: offsetX,
            y: offsetY
          },
          contentSize: {
            width: contentWidth,
            height: contentHeight
          }
        }
      } = event;
      const horizontal = options.horizontal;
      const threshold = options.threshold || DEFAULT_THRESHOLD;
      const layoutSize = horizontal ? layoutWidth : layoutHeight;
      const offset = horizontal ? offsetX : offsetY;
      const contentSize = horizontal ? contentWidth : contentHeight;
      const closeToStart = offset <= threshold;

      if (closeToStart !== isScrollAtStart) {
        setScrollAtStart(closeToStart);
      }

      const closeToEnd = layoutSize + offset >= contentSize - threshold;

      if (closeToEnd !== isScrollAtEnd) {
        setScrollAtEnd(closeToEnd);
      }
    }, [isScrollAtStart, isScrollAtEnd]);
    return /*#__PURE__*/React.createElement(WrappedComponent, _extends({}, props, {
      scrollReachedProps: {
        onScroll,
        isScrollAtStart,
        isScrollAtEnd
      },
      ref: props.forwardedRef
    }));
  };

  hoistStatics(ScrollReachedDetector, WrappedComponent);
  return forwardRef(ScrollReachedDetector);
}

export default withScrollReached;