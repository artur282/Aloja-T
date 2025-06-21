import { Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';

// ===== MICRO-ANIMATIONS UTILITY =====

// Bounce animation for buttons and interactive elements
export const bounceAnimation = (animatedValue, toValue = 1.1, duration = 150) => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }),
  ]);
};

// Pulse animation for notifications and alerts
export const pulseAnimation = (animatedValue, minValue = 0.95, maxValue = 1.05, duration = 800) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: maxValue,
        duration,
        easing: Easing.inOut(Easing.sine),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: minValue,
        duration,
        easing: Easing.inOut(Easing.sine),
        useNativeDriver: true,
      }),
    ])
  );
};

// Fade in animation for screen transitions
export const fadeInAnimation = (animatedValue, duration = 300, delay = 0) => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    delay,
    easing: Easing.out(Easing.quad),
    useNativeDriver: true,
  });
};

// Slide in from bottom animation
export const slideInFromBottom = (animatedValue, duration = 400) => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    easing: Easing.out(Easing.back(1.2)),
    useNativeDriver: true,
  });
};

// Slide in from right animation
export const slideInFromRight = (animatedValue, duration = 300) => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    easing: Easing.out(Easing.quad),
    useNativeDriver: true,
  });
};

// Scale in animation for modals and popups
export const scaleInAnimation = (animatedValue, duration = 250) => {
  return Animated.spring(animatedValue, {
    toValue: 1,
    tension: 100,
    friction: 8,
    useNativeDriver: true,
  });
};

// Shake animation for errors
export const shakeAnimation = (animatedValue, intensity = 10, duration = 500) => {
  const shakeSequence = [];
  const numberOfShakes = 4;
  
  for (let i = 0; i < numberOfShakes; i++) {
    shakeSequence.push(
      Animated.timing(animatedValue, {
        toValue: intensity * (i % 2 === 0 ? 1 : -1),
        duration: duration / (numberOfShakes * 2),
        useNativeDriver: true,
      })
    );
    shakeSequence.push(
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: duration / (numberOfShakes * 2),
        useNativeDriver: true,
      })
    );
  }
  
  return Animated.sequence(shakeSequence);
};

// Rotation animation for loading spinners
export const rotateAnimation = (animatedValue, duration = 1000) => {
  return Animated.loop(
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  );
};

// Stagger animation for list items
export const staggerAnimation = (animatedValues, duration = 200, staggerDelay = 100) => {
  const animations = animatedValues.map((value, index) =>
    Animated.timing(value, {
      toValue: 1,
      duration,
      delay: index * staggerDelay,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    })
  );
  
  return Animated.parallel(animations);
};

// ===== HAPTIC FEEDBACK HELPERS =====

export const lightHaptic = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

export const mediumHaptic = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

export const heavyHaptic = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
};

export const successHaptic = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

export const warningHaptic = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

export const errorHaptic = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};

// ===== GESTURE ANIMATIONS =====

// Swipe to dismiss animation
export const swipeToDismiss = (animatedValue, threshold = 100, onDismiss) => {
  return Animated.timing(animatedValue, {
    toValue: threshold,
    duration: 200,
    easing: Easing.out(Easing.quad),
    useNativeDriver: true,
  });
};

// Pull to refresh animation
export const pullToRefresh = (animatedValue, maxPull = 100) => {
  return Animated.spring(animatedValue, {
    toValue: maxPull,
    tension: 100,
    friction: 8,
    useNativeDriver: true,
  });
};

// ===== COMBINED ANIMATIONS =====

// Button press with haptic feedback
export const animatedButtonPress = (scaleValue, onPress, hapticType = 'light') => {
  return () => {
    // Haptic feedback
    switch (hapticType) {
      case 'medium':
        mediumHaptic();
        break;
      case 'heavy':
        heavyHaptic();
        break;
      default:
        lightHaptic();
    }
    
    // Animation
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Execute callback
    if (onPress) {
      setTimeout(onPress, 50);
    }
  };
};

// Heart animation for favorites
export const heartAnimation = (scaleValue, colorValue, onToggle) => {
  return () => {
    mediumHaptic();
    
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(colorValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
    
    if (onToggle) {
      onToggle();
    }
  };
};

// ===== INTERPOLATION HELPERS =====

export const createRotateInterpolation = (animatedValue) => {
  return animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
};

export const createScaleInterpolation = (animatedValue, inputRange = [0, 1], outputRange = [0, 1]) => {
  return animatedValue.interpolate({
    inputRange,
    outputRange,
    extrapolate: 'clamp',
  });
};

export const createOpacityInterpolation = (animatedValue, inputRange = [0, 1], outputRange = [0, 1]) => {
  return animatedValue.interpolate({
    inputRange,
    outputRange,
    extrapolate: 'clamp',
  });
};
