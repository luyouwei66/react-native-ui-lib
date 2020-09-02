import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {StyleSheet} from 'react-native';
import {Constants} from '../../helpers';
import {Colors} from '../../style';
import {BaseComponent} from '../../commons';
import {LogService} from '../../services';
import Modal from '../modal';
import View from '../view';
import PanListenerView from '../panningViews/panListenerView';
import DialogDismissibleView from './DialogDismissibleView';
import OverlayFadingBackground from './OverlayFadingBackground';
import PanningProvider from '../panningViews/panningProvider';

// TODO: KNOWN ISSUES
// 1. iOS pressing on the background while enter animation is happening will not call onDismiss
//    Touch events are not registered?
// 2. SafeArea is transparent
// 3. Check why we need the state change in DialogDismissibleView -> onLayout -> animateTo

/**
 * @description: Dialog component for displaying custom content inside a popup dialog
 * @notes: Use alignment modifiers to control the dialog position
 * (top, bottom, centerV, centerH, etc... by default the dialog is aligned to center)
 * @modifiers: alignment
 * @example: https://github.com/wix/react-native-ui-lib/blob/master/demo/src/screens/componentScreens/DialogScreen.js
 * @gif: https://media.giphy.com/media/9S58XdLCoUiLzAc1b1/giphy.gif
 */
class Dialog extends BaseComponent {
  static displayName = 'Dialog';
  static propTypes = {
    /**
     * Control visibility of the dialog
     */
    visible: PropTypes.bool,
    /**
     * Dismiss callback for when clicking on the background
     */
    onDismiss: PropTypes.func,
    /**
     * The color of the overlay background
     */
    overlayBackgroundColor: PropTypes.string,
    /**
     * The dialog width (default: 90%)
     */
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    /**
     * The dialog height (default: undefined)
     */
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    /**
     * The direction of the allowed pan (default is DOWN).
     * Types: UP, DOWN, LEFT and RIGHT (using PanningProvider.Directions.###).
     * Pass null to remove pan.
     */
    panDirection: PropTypes.oneOf(Object.values(PanningProvider.Directions)),
    /**
     * Whether or not to handle SafeArea
     */
    useSafeArea: PropTypes.bool,
    /**
     * Called once the modal has been dismissed (iOS only) - Deprecated, use onDialogDismissed instead
     */
    onModalDismissed: PropTypes.func,
    /**
     * Called once the dialog has been dismissed completely
     */
    onDialogDismissed: PropTypes.func,
    /**
     * If this is added only the header will be pannable;
     * this allows for scrollable content (the children of the dialog)
     * props are transferred to the renderPannableHeader
     */
    renderPannableHeader: PropTypes.elementType,
    /**
     * The props that will be passed to the pannable header
     */
    pannableHeaderProps: PropTypes.any,
    /**
     * The Dialog`s container style
     */
    containerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array])
  };

  static defaultProps = {
    overlayBackgroundColor: Colors.rgba(Colors.dark10, 0.6)
  };

  constructor(props) {
    super(props);

    this.state = {
      alignments: this.state.alignments,
      orientationKey: Constants.orientation,
      modalVisibility: props.visible,
      dialogVisibility: props.visible
    };

    this.setAlignment();

    if (!_.isUndefined(props.onModalDismissed)) {
      LogService.deprecationWarn({component: 'Dialog', oldProp: 'onModalDismissed', newProp: 'onDialogDismissed'});
    }
  }

  componentDidMount() {
    Constants.addDimensionsEventListener(this.onOrientationChange);
  }

  componentWillUnmount() {
    Constants.removeDimensionsEventListener(this.onOrientationChange);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {visible: nexVisible} = nextProps;
    const {visible} = this.props;

    if (nexVisible && !visible) {
      this.setState({modalVisibility: true, dialogVisibility: true});
    } else if (visible && !nexVisible) {
      this.hideDialogView();
    }
  }

  onOrientationChange = () => {
    const orientationKey = Constants.orientation;
    if (this.state.orientationKey !== orientationKey) {
      this.setState({orientationKey});
    }
  };

  generateStyles() {
    this.styles = createStyles(this.getThemeProps());
  }

  setAlignment() {
    const {alignments} = this.state;
    if (_.isEmpty(alignments)) {
      this.styles.alignments = this.styles.centerContent;
    } else {
      this.styles.alignments = alignments;
    }
  }

  onDismiss = () => {
    this.setState({modalVisibility: false}, () => {
      const props = this.getThemeProps();
      if (props.visible) {
        _.invoke(props, 'onDismiss', props);
      }
      // Parity with iOS Modal's onDismiss
      if (Constants.isAndroid) {
        _.invoke(props, 'onDialogDismissed', props);
      }
    });
  };

  onModalDismissed = () => {
    _.invoke(this.props, 'onDialogDismissed', this.props);
    _.invoke(this.props, 'onModalDismissed', this.props);
  }

  hideDialogView = () => {
    this.setState({dialogVisibility: false});
  };

  renderPannableHeader = directions => {
    const {renderPannableHeader, pannableHeaderProps} = this.getThemeProps();
    if (renderPannableHeader) {
      return <PanListenerView directions={directions}>{renderPannableHeader(pannableHeaderProps)}</PanListenerView>;
    }
  };

  renderDialogView = () => {
    const {children, renderPannableHeader, panDirection = PanningProvider.Directions.DOWN, containerStyle, testID} = this.getThemeProps();
    const {dialogVisibility} = this.state;
    const Container = renderPannableHeader ? View : PanListenerView;

    return (
      <View testID={testID} style={[this.styles.dialogViewSize]} pointerEvents="box-none">
        <PanningProvider>
          <DialogDismissibleView
            direction={panDirection}
            visible={dialogVisibility}
            onDismiss={this.onDismiss}
            containerStyle={this.styles.flexType}
            style={this.styles.flexType}
          >
            <Container directions={[panDirection]} style={[this.styles.overflow, this.styles.flexType, containerStyle]}>
              {this.renderPannableHeader([panDirection])}
              {children}
            </Container>
          </DialogDismissibleView>
        </PanningProvider>
      </View>
    );
  };

  // TODO: renderOverlay {_.invoke(this.getThemeProps(), 'renderOverlay')}
  renderDialogContainer = () => {
    const {modalVisibility, dialogVisibility} = this.state;
    const {useSafeArea, bottom, overlayBackgroundColor} = this.getThemeProps();
    const addBottomSafeArea = Constants.isIphoneX && (useSafeArea && bottom);
    const bottomInsets = Constants.getSafeAreaInsets().bottom - 8; // TODO: should this be here or in the input style?

    return (
      <View
        useSafeArea={useSafeArea}
        style={[this.styles.centerHorizontal, this.styles.alignments, this.styles.container]}
        pointerEvents="box-none"
      >
        <OverlayFadingBackground
          modalVisibility={modalVisibility}
          dialogVisibility={dialogVisibility}
          overlayBackgroundColor={overlayBackgroundColor}
        />
        {this.renderDialogView()}
        {addBottomSafeArea && <View style={{marginTop: bottomInsets}}/>}
      </View>
    );
  };

  render = () => {
    const {orientationKey, modalVisibility} = this.state;
    const {testID, supportedOrientations, accessibilityLabel} = this.getThemeProps();

    return (
      <Modal
        key={orientationKey}
        testID={`${testID}.modal`}
        transparent
        visible={modalVisibility}
        animationType={'none'}
        onBackgroundPress={this.hideDialogView}
        onRequestClose={this.hideDialogView}
        onDismiss={this.onModalDismissed}
        supportedOrientations={supportedOrientations}
        accessibilityLabel={accessibilityLabel}
      >
        {this.renderDialogContainer()}
      </Modal>
    );
  };
}

function createStyles(props) {
  const {width = '90%', height} = props;
  const flexType = height ? {flex: 1} : {flex: 0};
  return StyleSheet.create({
    dialogViewSize: {width, height},
    flexType,
    container: {
      flex: 1
    },
    centerHorizontal: {
      alignItems: 'center'
    },
    centerContent: {
      justifyContent: 'center'
    },
    overflow: {
      overflow: 'hidden'
    }
  });
}

export default Dialog;
