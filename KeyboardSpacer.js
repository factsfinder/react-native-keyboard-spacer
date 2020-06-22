/**
 * Created by andrewhurst on 10/5/15.
 */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Keyboard,
  LayoutAnimation,
  View,
  Dimensions,
  Platform,
  StyleSheet,
} from "react-native";

const styles = StyleSheet.create({
  container: {
    left: 0,
    right: 0,
    bottom: 0,
  },
});

// From: https://medium.com/man-moon/writing-modern-react-native-ui-e317ff956f02
const defaultAnimation = {
  duration: 500,
  create: {
    duration: 300,
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  update: {
    type: LayoutAnimation.Types.spring,
    springDamping: 200,
  },
};

function KeyboardSpacer({ topSpacing, onToggle }) {
  const [keyboardSpace, setKeyboardSpace] = useState(0);
  const [isKeyboardOpened, setIsKeyboardOpened] = useState(false);

  const IS_ANDROID = Platform.OS === "android";
  const IS_IOS = Platform.OS === "ios";

  function configureLayoutAnimation(event) {
    let animationConfig = defaultAnimation;
    if (IS_IOS) {
      animationConfig = LayoutAnimation.create(
        event.duration,
        LayoutAnimation.Types[event.easing],
        LayoutAnimation.Properties.opacity
      );
    }
    LayoutAnimation.configureNext(animationConfig);
  }

  function updateKeyboardSpace(event) {
    if (!event.endCoordinates) {
      return;
    }
    configureLayoutAnimation(event);
    // get updated on rotation
    const screenHeight = Dimensions.get("window").height;
    // when external physical keyboard is connected
    // event.endCoordinates.height still equals virtual keyboard height
    // however only the keyboard toolbar is showing if there should be one
    const newKeyboardSpace =
      screenHeight - event.endCoordinates.screenY + topSpacing;
    setKeyboardSpace(newKeyboardSpace);
    setIsKeyboardOpened(true);
    onToggle(true, keyboardSpace);
  }

  function resetKeyboardSpace(event) {
    configureLayoutAnimation(event);
    setKeyboardSpace(0);
    setIsKeyboardOpened(false);
    onToggle(false, 0);
  }

  useEffect(() => {
    const updateListener = Keyboard.addListener(
      IS_ANDROID ? "keyboardDidShow" : "keyboardWillShow",
      updateKeyboardSpace
    );

    const resetListener = Keyboard.addListener(
      IS_ANDROID ? "keyboardDidHide" : "keyboardWillHide",
      resetKeyboardSpace
    );
    return () => {
      updateListener.remove();
      resetListener.remove();
    };
  }, []);

  return <View style={[styles.container, { height: keyboardSpace }]} />;
}

KeyboardSpacer.defaultProps = {
  topSpacing: 0,
  onToggle: () => null,
};

KeyboardSpacer.propTypes = {
  topSpacing: PropTypes.number,
  onToggle: PropTypes.func,
};

export default KeyboardSpacer;
