import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    withDelay,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Import Images
const cowImages = [
    require('../../assets/images/_2.png'),
    require('../../assets/images/_1.png'),
    require('../../assets/images/_3.png'),
];
// Assuming _4.png is the hands holding phone image
const handsImage = require('../../assets/images/_4.png');

export const GuidanceAnimation = ({ step = 0 }: { step?: number }) => {
    // Shared Value for Hands Position (Vertical Slide)
    const handsTranslateY = useSharedValue(300); // Start off-screen (down)

    // Animation Logic
    useEffect(() => {
        // Reset to bottom first
        handsTranslateY.value = 300;

        // Animate sliding up to center
        // Target Y: 0 puts it at the bottom of the container (defined by styles)
        // To move it "up till center", we might want a slight negative value or just 0 if the container is positioned well.
        // Let's aim for a position where the phone is clearly visible.

        let targetY = 0;
        if (step === 1 || step === 2) {
            targetY = -1; // Move up a bit more for Front and Angle views
        }

        handsTranslateY.value = withDelay(
            100,
            withTiming(targetY, {
                duration: 1000,
                easing: Easing.out(Easing.cubic),
            })
        );

    }, [step]);

    // Animated Styles
    const handsStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: handsTranslateY.value },
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
    const currentCowImage = cowImages[step] || cowImages[0];

    return (
        <View style={styles.wrapper}>
            {/* Main Animation Canvas */}
            <View style={styles.canvas}>

                {/* Full Container Cow Background */}
                <Image
                    source={currentCowImage}
                    style={styles.cowBackground}
                    resizeMode="cover"
                />

                {/* Step Badge (Top Corner) */}
                <View style={[styles.stepBadge, { backgroundColor: currentStep.color }]}>
                    <Text style={styles.stepText}>{currentStep.label}</Text>
                </View>

                {/* Hands Holding Phone Overlay */}
                <Animated.View style={[styles.handsContainer, handsStyle]}>
                    <Image
                        source={handsImage}
                        style={styles.handsImage}
                        resizeMode="contain"
                    />
                </Animated.View>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 20,
        width: '100%',
        alignItems: 'center'
    },
    canvas: {
        width: width - 40, // Full width minus padding
        height: 280, // Reduced height as requested
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        overflow: 'hidden',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    cowBackground: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
    },
    stepBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        zIndex: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    stepText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    handsContainer: {
        position: 'absolute',
        bottom: 0, // Align to bottom
        left: 0,
        right: 0,
        height: 220, // Slightly reduced to fit better in 300px container
        alignItems: 'center',
        justifyContent: 'flex-end',
        zIndex: 10,
    },
    handsImage: {
        width: '100%', // Increased width for better visibility
        height: '100%',
    },
});
