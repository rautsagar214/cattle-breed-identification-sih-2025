import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Animation Specs
const CYCLE_DURATION = 4000; // 4 seconds per step
const OSCILLATION_DURATION = 1000; // 1 second for full cycle (50ms updates * 20 steps approx, smoothed)
// Actually user said: "Frequency: Updates every 50ms, moves 2px per update" -> This implies a linear step-by-step, 
// but "100ms CSS transition" implies smooth. I will use smooth sine wave oscillation for better visual quality 
// matching the "pulsing" description.

export const GuidanceAnimation = ({ step = 0 }: { step?: number }) => {
    // Shared Values for Arrow/Camera Position
    const arrowTranslateX = useSharedValue(0);
    const arrowTranslateY = useSharedValue(0);
    const rotation = useSharedValue(0);

    // Continuous Oscillation Animation
    useEffect(() => {
        // Reset
        arrowTranslateX.value = 0;
        arrowTranslateY.value = 0;

        const distance = 15; // Reduced movement slightly for smaller canvas
        const duration = 1000; // 1 second per pulse cycle

        if (step === 0) {
            // Step 1: Horizontal (Side View)
            rotation.value = 0;
            arrowTranslateX.value = withRepeat(
                withSequence(
                    withTiming(-distance, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
                ),
                -1, // Infinite
                true // Reverse
            );
        } else if (step === 1) {
            // Step 2: Vertical (Front View)
            rotation.value = 270;
            arrowTranslateY.value = withRepeat(
                withSequence(
                    withTiming(distance, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
        } else if (step === 2) {
            // Step 3: Diagonal (45 Degree)
            rotation.value = 320;
            // Move both X and Y
            const diagDist = distance * 0.7;
            arrowTranslateX.value = withRepeat(
                withSequence(
                    withTiming(diagDist, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
            arrowTranslateY.value = withRepeat(
                withSequence(
                    withTiming(-diagDist, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
        }
    }, [step]);

    // Animated Styles
    const arrowStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: arrowTranslateX.value },
                { translateY: arrowTranslateY.value },
                { rotate: `${rotation.value}deg` },
            ],
        };
    });

    // Step Config
    const steps = [
        {
            id: 0,
            label: 'Step 1: Side View',
            color: '#3b82f6', // Blue
        },
        {
            id: 1,
            label: 'Step 2: Front View',
            color: '#10b981', // Green
        },
        {
            id: 2,
            label: 'Step 3: 45° Angle',
            color: '#f59e0b', // Orange
        },
    ];

    const currentStep = steps[step] || steps[0];

    return (
        <View style={styles.wrapper}>
            {/* Main Animation Canvas */}
            <View style={styles.canvas}>

                {/* Central Cattle Subject */}
                <View style={styles.cattleContainer}>

                    <Image
                        source={require('../../assets/images/cowimage.png')}
                        style={styles.cattleImage}
                        resizeMode="cover"
                    />

                </View>

                {/* Camera Icon */}
                <View style={[
                    styles.cameraBadge,
                    { backgroundColor: currentStep.color },
                    step === 0 ? { left: 40, top: '20%' } : // Side: Right, vertically centered
                        step === 1 ? { bottom: 30, left: '45%', marginLeft: -20 } : // Front: Top, horizontally centered
                            { bottom: 100, left: '18%' } // Angle: Bottom-Right
                ]}>
                    <Ionicons name="camera" size={20} color="white" />
                </View>

                {/* Animated Arrow */}
                <Animated.View style={[
                    styles.arrowContainer,
                    arrowStyle,
                    step === 0 ? { left: 20, top: '38%' } : // Side -> Point Left
                        step === 1 ? { bottom: 30, left: '41%' } : // Front -> Point Down
                            { bottom: 65, left: 34 } // Angle -> Point Top-Left
                ]}>
                    {/* Arrow Shaft */}
                    <View style={[styles.arrowShaft, { backgroundColor: currentStep.color }]} />
                    {/* Arrow Head */}
                    <View style={[styles.arrowHead, { borderLeftColor: currentStep.color }]} />
                </Animated.View>

                {/* Step Indicator Badge (Inside Canvas) */}
                <View style={styles.stepBadge}>
                    <Text style={styles.stepText}>{currentStep.label}</Text>
                </View>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 20,
    },
    canvas: {
        height: 280, // Reduced from 384
        // backgroundColor: '#1e293b', // slate-800
        borderRadius: 16,
        padding: 20,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    cattleContainer: {
        zIndex: 10,
        width: 100, // Reduced from 140
        height: 200,
        overflow: 'hidden',
        marginTop: -60,
    },
    cattleImage: {
        width: '100%',
        height: '100%',
    },
    cameraBadge: {
        position: 'absolute',
        width: 40, // Reduced from 48
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    arrowContainer: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        width: 100, // Reduced from 120
        height: 20, // Hitbox
        zIndex: 15,
    },
    arrowShaft: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },
    arrowHead: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 12, // Reduced
        borderRightWidth: 0,
        borderBottomWidth: 8,
        borderTopWidth: 8,
        borderLeftColor: 'black', // Overridden dynamically
        borderBottomColor: 'transparent',
        borderTopColor: 'transparent',
        marginLeft: -2, // Overlap slightly
    },
    stepBadge: {
        position: 'absolute',
        bottom: 15,
        right: 0,
        backgroundColor: 'rgba(51, 65, 85, 0.9)', // slate-700 with opacity
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#475569', // slate-600
    },
    stepText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
