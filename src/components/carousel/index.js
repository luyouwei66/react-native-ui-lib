import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {Constants} from '../../helpers';
import {Colors} from '../../style';
import {BaseComponent} from '../../commons';
import View from '../view';
import Text from '../text';
import PageControl from '../pageControl';
import * as presenter from './CarouselPresenter';

const PAGE_CONTROL_POSITIONS = {
  OVER: 'over',
  UNDER: 'under'
};

/**
 * @description: Carousel for scrolling pages horizontally
 * @gif: https://media.giphy.com/media/l0HU7f8gjpRlMRhKw/giphy.gif, https://media.giphy.com/media/3oFzmcjX9OhpyckhcQ/giphy.gif
 * @example: https://github.com/wix/react-native-ui-lib/blob/master/demo/src/screens/componentScreens/CarouselScreen.js
 * @extends: ScrollView
 * @extendsLink: https://facebook.github.io/react-native/docs/scrollview
 * @notes: This is screed width Component
 */
export default class Carousel extends BaseComponent {
  static displayName = 'Carousel';

  static propTypes = {
    /**
     * the first page to start with
     */
    initialPage: PropTypes.number,
    /**
     * the page width (all pages should have the same width). Does not work if passing 'loop' prop
     */
    pageWidth: PropTypes.number,
    /**
     * the spacing between the items
     */
    itemSpacings: PropTypes.number,
    /**
     * Horizontal margin for the container
     */
    containerMarginHorizontal: PropTypes.number,
    /**
     * Vertical padding for the container.
     * Sometimes needed when there are overflows that are cut in Android.
     */
    containerPaddingVertical: PropTypes.number,
    /**
     * if true, will have infinite scroll
     */
    loop: PropTypes.bool,
    /**
     * callback for when page has changed
     */
    onChangePage: PropTypes.func,
    /**
     * callback for onScroll event of the internal ScrollView
     */
    onScroll: PropTypes.func,
    /**
     * Should the container be animated (send the animation style via containerStyle)
     */
    animated: PropTypes.bool,
    /**
     * the carousel style
     */
    containerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]),
    /**
     * PageControl component props
     */
    pageControlProps: PropTypes.shape(PageControl.propTypes),
    /**
     * The position of the PageControl component ['over', 'under'], otherwise it won't display
     */
    pageControlPosition: PropTypes.oneOf(Object.values(PAGE_CONTROL_POSITIONS)),
    /**
     * whether to show a page counter (will not work with 'pageWidth' prop)
     */
    showCounter: PropTypes.bool,
    /**
     * the counter's text style
     */
    counterTextStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]),
    /**
     * will block multiple pages scroll (will not work with 'pageWidth' prop)
     */
    pagingEnabled: PropTypes.bool,
    /**
     * Whether to layout Carousel for accessibility
     */
    allowAccessibleLayout: PropTypes.bool,
    /**
     * Whether to switch automatically between the pages
     */
    autoplay: PropTypes.bool,
    /**
     * the amount of ms to wait before switching to the next page, in case autoplay is on
     */
    autoplayInterval: PropTypes.number
  };

  static defaultProps = {
    initialPage: 0,
    pagingEnabled: true,
    autoplay: false,
    autoplayInterval: 4000
  };

  static pageControlPositions = PAGE_CONTROL_POSITIONS;

  constructor(props) {
    super(props);

    const themeProps = this.getThemeProps();
    this.carousel = React.createRef();
    const defaultPageWidth = (themeProps.loop || !themeProps.pageWidth) ? Constants.screenWidth : themeProps.pageWidth;
    
    this.state = {
      containerWidth: undefined,
      currentPage: this.shouldUsePageWidth() ? this.getCalcIndex(themeProps.initialPage) : themeProps.initialPage,
      currentStandingPage: themeProps.initialPage,
      pageWidth: defaultPageWidth,
      initialOffset: {x: presenter.calcOffset(themeProps, {currentPage: themeProps.initialPage, pageWidth: defaultPageWidth})}
    };
  }

  componentDidMount() {
    Constants.addDimensionsEventListener(this.onOrientationChanged);

    if (this.getThemeProps().autoplay) {
      this.startAutoPlay();
    }
  }

  // TODO: change to getDerivedStateFromProps (requires changing from BaseComponent to asBaseComponent)
  UNSAFE_componentWillReceiveProps(nextProps) {
    const {currentPage} = this.state;
    const {pageWidth: nexPageWidth} = nextProps;
    const {pageWidth} = this.getThemeProps();

    if (pageWidth !== nexPageWidth) {
      const pageWidth = nexPageWidth;
      this.setState({
        pageWidth,
        initialOffset: {x: presenter.calcOffset(this.getThemeProps(), {currentPage, pageWidth})}
      });
    }
  }

  componentWillUnmount() {
    Constants.removeDimensionsEventListener(this.onOrientationChanged);
    clearInterval(this.autoplayTimer);
  }

  componentDidUpdate(prevProps, prevState) {
    const {autoplay} = this.getThemeProps();
    if (autoplay && !prevProps.autoplay) {
      this.startAutoPlay();
    } else if (!autoplay && prevProps.autoplay) {
      this.stopAutoPlay();
    }
  }

  onOrientationChanged = () => {
    const {pageWidth, loop} = this.getThemeProps();
    if (!pageWidth || loop) {
      this.orientationChange = true;
      // HACK: setting to containerWidth for Android's call when view disappear
      this.setState({pageWidth: this.state.containerWidth || Constants.screenWidth});
    }
  };

  generateStyles() {
    this.styles = createStyles(this.getThemeProps());
  }

  getItemSpacings(props) {
    const {itemSpacings = 16} = props;
    return itemSpacings;
  }

  getContainerMarginHorizontal = () => {
    const {containerMarginHorizontal = 0} = this.getThemeProps();
    return containerMarginHorizontal;
  }

  // TODO: RN 61.5 - try to remove this from the children and move to the ScrollView's contentContainerStyle
  // style={{overflow: 'visible'}} does not work in ScrollView on Android, maybe it will be fixed in the future
  getContainerPaddingVertical = () => {
    const {containerPaddingVertical = 0} = this.getThemeProps();
    return containerPaddingVertical;
  }

  updateOffset = (animated = false) => {
    const x = presenter.calcOffset(this.getThemeProps(), this.state);

    if (this.carousel) {
      this.carousel.current.scrollTo({x, animated});

      if (Constants.isAndroid) {
        // this is done to handle onMomentumScrollEnd not being called in Android:
        // https://github.com/facebook/react-native/issues/11693
        // https://github.com/facebook/react-native/issues/19246
        this.onMomentumScrollEnd();
      }
    }
  };

  

  startAutoPlay() {    
    this.autoplayTimer = setInterval(() => {      
      this.goToNextPage();
    }, this.getThemeProps().autoplayInterval);
  }

  stopAutoPlay() {
    clearInterval(this.autoplayTimer);
  }  

  resetAutoPlay() {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  goToPage(pageIndex, animated = true) {
    this.setState({currentPage: this.getCalcIndex(pageIndex)}, () => this.updateOffset(animated));
  }

  getCalcIndex(index) {
    // to handle scrollView index issue in Android's RTL layout
    if (Constants.isRTL && Constants.isAndroid) {
      const length = presenter.getChildrenLength(this.props) - 1;
      return length - index;
    }
    return index;
  }

  getSnapToOffsets = () => {
    const {containerWidth, pageWidth} = this.state;

    if (this.shouldEnablePagination()) {
      return undefined;
    }

    if (containerWidth) {
      const spacings = pageWidth === containerWidth ? 0 : this.getItemSpacings(this.getThemeProps());
      const initialBreak = pageWidth - (containerWidth - pageWidth - spacings) / 2;
      const snapToOffsets = _.times(presenter.getChildrenLength(this.props),
        index => initialBreak + index * pageWidth + this.getContainerMarginHorizontal());
      return snapToOffsets;
    }
  };

  shouldUsePageWidth() {
    const {loop, pageWidth} = this.getThemeProps();
    return !loop && pageWidth;
  }

  shouldEnablePagination() {
    const {pagingEnabled} = this.getThemeProps();
    return pagingEnabled && !this.shouldUsePageWidth();
  }

  onContainerLayout = ({nativeEvent: {layout: {width: containerWidth}}}) => {
    const update = {containerWidth};
    const {pageWidth = containerWidth} = this.getThemeProps();

    update.pageWidth = pageWidth;
    update.initialOffset = {
      x: presenter.calcOffset(this.getThemeProps(), {currentPage: this.state.currentPage, pageWidth})
    };

    this.setState(update);
  };

  shouldAllowAccessibilityLayout() {
    const {allowAccessibleLayout} = this.getThemeProps();
    return allowAccessibleLayout && Constants.accessibility.isScreenReaderEnabled;
  }

  onContentSizeChange = () => {
    // this is to handle initial scroll position (content offset)
    if (Constants.isAndroid) {
      this.updateOffset();
    }
  };

  onMomentumScrollEnd = () => {
    // finished full page scroll
    const {currentStandingPage, currentPage} = this.state;
    const index = this.getCalcIndex(currentPage);
    
    this.setState({currentStandingPage: index});
    if (currentStandingPage !== index) {
      _.invoke(this.getThemeProps(), 'onChangePage', index, currentStandingPage);
    }
  };

  goToNextPage() {
    const {currentPage} = this.state;
    const pagesCount = presenter.getChildrenLength(this.getThemeProps());
    const {loop} = this.getThemeProps();        

    let nextPageIndex;
    if (loop) {
      nextPageIndex = currentPage + 1;
    } else {
      nextPageIndex = Math.min(pagesCount - 1, currentPage + 1);
    }

    this.goToPage(nextPageIndex, true);

    // in case of a loop, after we advanced right to the cloned first page, 
    // we return silently to the real first page
    if (loop && currentPage === pagesCount) {
      this.goToPage(0, false);
    }  
  }

  onScroll = event => {
    if (!this.skippedInitialScroll) {
      this.skippedInitialScroll = true;
      return;
    }

    const {loop, autoplay} = this.getThemeProps();
    const {pageWidth} = this.state;
    const offsetX = event.nativeEvent.contentOffset.x;

    if (offsetX >= 0) {
      if (!this.orientationChange) { // Avoid new calculation on orientation change
        const newPage = presenter.calcPageIndex(offsetX, this.getThemeProps(), pageWidth);
        this.setState({currentPage: newPage});
      }
      this.orientationChange = false;
    }

    if (loop && presenter.isOutOfBounds(offsetX, this.getThemeProps(), pageWidth)) {
      this.updateOffset();
    }

    if (autoplay) { // reset the timer to avoid auto scroll immediately after manual one
      this.resetAutoPlay();
    }

    _.invoke(this.getThemeProps(), 'onScroll', event);
  };

  renderChild = (child, key) => {
    if (child) {
      const paddingLeft = this.shouldUsePageWidth() ? this.getItemSpacings(this.getThemeProps()) : undefined;
      const index = Number(key);
      const length = presenter.getChildrenLength(this.props);
      const containerMarginHorizontal = this.getContainerMarginHorizontal();
      const marginLeft = index === 0 ? containerMarginHorizontal : 0;
      const marginRight = index === length - 1 ? containerMarginHorizontal : 0;
      const paddingVertical = this.getContainerPaddingVertical();

      return (
        <View
          style={{width: this.state.pageWidth, paddingLeft, marginLeft, marginRight, paddingVertical}}
          key={key}
          collapsable={false}
        >
          {this.shouldAllowAccessibilityLayout() && !Number.isNaN(index) &&
            <View style={this.styles.hiddenText}>
              <Text>{`page ${index + 1} out of ${length}`}</Text>
            </View>
          }
          {child}
        </View>
      );
    }
  };

  renderChildren() {
    const {children, loop} = this.getThemeProps();
    const length = presenter.getChildrenLength(this.props);

    const childrenArray = React.Children.map(children, (child, index) => {
      return this.renderChild(child, `${index}`);
    });

    if (loop) {
      childrenArray.unshift(this.renderChild(children[length - 1], `${length - 1}-clone`));
      childrenArray.push(this.renderChild(children[0], `${0}-clone`));
    }

    return childrenArray;
  }

  renderPageControl() {
    const {pageControlPosition, pageControlProps = {}} = this.getThemeProps();
    
    if (pageControlPosition) {
      const {size = 6, spacing = 8, color = Colors.dark20, inactiveColor = Colors.dark60, ...others} = pageControlProps;
      const pagesCount = presenter.getChildrenLength(this.props);
      const containerStyle =
        pageControlPosition === PAGE_CONTROL_POSITIONS.UNDER
          ? this.styles.pageControlContainerStyleUnder
          : this.styles.pageControlContainerStyle;

      return (
        <PageControl
          size={size}
          spacing={spacing}
          containerStyle={containerStyle}
          inactiveColor={inactiveColor}
          color={color}
          {...others}
          numOfPages={pagesCount}
          currentPage={this.getCalcIndex(this.state.currentPage)}
        />
      );
    }
  }

  renderCounter() {
    const {pageWidth, showCounter, counterTextStyle} = this.getThemeProps();
    const {currentPage} = this.state;
    const pagesCount = presenter.getChildrenLength(this.props);

    if (showCounter && !pageWidth) {
      return (
        <View center style={this.styles.counter}>
          <Text dark80 text90 style={[{fontWeight: 'bold'}, counterTextStyle]}>
            {currentPage + 1}/{pagesCount}
          </Text>
        </View>
      );
    }
  }

  renderAccessibleLayout() {
    const {containerStyle, children} = this.getThemeProps();

    return (
      <View style={containerStyle} onLayout={this.onContainerLayout}>
        <ScrollView
          ref={this.carousel}
          showsVerticalScrollIndicator={false}
          pagingEnabled
          onContentSizeChange={this.onContentSizeChange}
          onScroll={this.onScroll}
          onMomentumScrollEnd={this.onMomentumScrollEnd}
        >
          {React.Children.map(children, (child, index) => {
            return this.renderChild(child, `${index}`);
          })}
        </ScrollView>
      </View>
    );
  }

  renderCarousel() {
    const {containerStyle, animated, ...others} = this.getThemeProps();
    const {initialOffset} = this.state;
    const scrollContainerStyle = this.shouldUsePageWidth() ? {paddingRight: this.getItemSpacings(this.getThemeProps())} : undefined;
    const snapToOffsets = this.getSnapToOffsets();
    const marginBottom = Math.max(0, this.getContainerPaddingVertical() - 16);

    return (
      <View animated={animated} style={[{marginBottom}, containerStyle]} onLayout={this.onContainerLayout}>
        <ScrollView
          {...others}
          ref={this.carousel}
          contentContainerStyle={scrollContainerStyle}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled={this.shouldEnablePagination()}
          snapToOffsets={snapToOffsets}
          decelerationRate="fast"
          contentOffset={initialOffset} // iOS only
          scrollEventThrottle={200}
          onContentSizeChange={this.onContentSizeChange}
          onScroll={this.onScroll}
          onMomentumScrollEnd={this.onMomentumScrollEnd}
        >
          {this.renderChildren()}
        </ScrollView>
        {this.renderPageControl()}
        {this.renderCounter()}
      </View>
    );
  }

  render() {
    return this.shouldAllowAccessibilityLayout() ? this.renderAccessibleLayout() : this.renderCarousel();
  }
}

function createStyles({containerPaddingVertical = 0}) {
  return StyleSheet.create({
    counter: {
      paddingHorizontal: 8,
      paddingVertical: 3, // height: 24,
      borderRadius: 20,
      backgroundColor: Colors.rgba(Colors.black, 0.6),
      position: 'absolute',
      top: 12,
      right: 12
    },
    pageControlContainerStyle: {
      position: 'absolute',
      bottom: 16,
      alignSelf: 'center'
    },
    pageControlContainerStyleUnder: {
      marginVertical: 16 - containerPaddingVertical
    },
    hiddenText: {
      position: 'absolute', 
      width: 1
    }
  });
}
