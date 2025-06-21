import React, { useRef } from 'react';
import { View, Animated, PanGestureHandler, State } from 'react-native';
import { useTheme } from '../../utils/themeContext';
import { lightHaptic, mediumHaptic } from '../../utils/animations';

const SwipeableCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  swipeThreshold = 100,
  style,
}) => {
  const { currentTheme } = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const leftActionOpacity = useRef(new Animated.Value(0)).current;
  const rightActionOpacity = useRef(new Animated.Value(0)).current;

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { 
      useNativeDriver: false,
      listener: (event) => {
        const { translationX } = event.nativeEvent;
        
        // Update action opacities based on swipe distance
        const leftOpacity = Math.max(0, Math.min(1, translationX / swipeThreshold));
        const rightOpacity = Math.max(0, Math.min(1, -translationX / swipeThreshold));
        
        leftActionOpacity.setValue(leftOpacity);
        rightActionOpacity.setValue(rightOpacity);
        
        // Haptic feedback at threshold
        if (Math.abs(translationX) >= swipeThreshold) {
          lightHaptic();
        }
      }
    }
  );

  const onHandlerStateChange = (event) => {
    const { state, translationX } = event.nativeEvent;
    
    if (state === State.END) {
      const shouldSwipeLeft = translationX > swipeThreshold;
      const shouldSwipeRight = translationX < -swipeThreshold;
      
      if (shouldSwipeLeft && onSwipeLeft) {
        mediumHaptic();
        // Animate out to the left
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 300,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(scale, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onSwipeLeft();
          resetPosition();
        });
      } else if (shouldSwipeRight && onSwipeRight) {
        mediumHaptic();
        // Animate out to the right
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: -300,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(scale, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onSwipeRight();
          resetPosition();
        });
      } else {
        // Snap back to center
        resetPosition();
      }
    }
  };

  const resetPosition = () => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: false,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(leftActionOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(rightActionOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={[{ position: 'relative' }, style]}>
      {/* Left Action */}
      {leftAction && (
        <Animated.View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 80,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: leftActionOpacity,
            zIndex: 1,
          }}
        >
          {leftAction}
        </Animated.View>
      )}
      
      {/* Right Action */}
      {rightAction && (
        <Animated.View
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 80,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: rightActionOpacity,
            zIndex: 1,
          }}
        >
          {rightAction}
        </Animated.View>
      )}
      
      {/* Main Content */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-10, 10]}
      >
        <Animated.View
          style={{
            transform: [
              { translateX },
              { scale },
            ],
            backgroundColor: currentTheme.surface,
            borderRadius: 12,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

export default SwipeableCard;
