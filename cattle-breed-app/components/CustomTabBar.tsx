import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { IconSymbol } from './ui/icon-symbol';

const { width } = Dimensions.get('window');

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    return (
        <View style={styles.container}>
            <View style={styles.tabBar}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label =
                        options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                                ? options.title
                                : route.name;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    // Center Button (Identify Breed / Upload)
                    if (route.name === 'upload') {
                        return (
                            <View key={route.key} style={styles.centerButtonContainer}>
                                <TouchableOpacity
                                    accessibilityRole="button"
                                    accessibilityState={isFocused ? { selected: true } : {}}
                                    accessibilityLabel={options.tabBarAccessibilityLabel}
                                    testID={(options as any).tabBarTestID}
                                    onPress={onPress}
                                    onLongPress={onLongPress}
                                    style={styles.centerButton}
                                >
                                    <IconSymbol size={32} name="camera.fill" color="white" />
                                </TouchableOpacity>
                            </View>
                        );
                    }

                    // Regular Tabs
                    let iconName = 'house.fill';
                    if (route.name === 'chatbot') iconName = 'message.fill';
                    if (route.name === 'settings') iconName = 'gearshape.fill';
                    if (route.name === 'profile') iconName = 'person.fill';
                    if (route.name === 'history') iconName = 'clock.fill';

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={(options as any).tabBarTestID}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={styles.tabItem}
                        >
                            <View style={[styles.iconContainer, isFocused && styles.activeIconContainer]}>
                                <IconSymbol
                                    size={24}
                                    name={iconName as any}
                                    color={isFocused ? '#526ff0ff' : '#9ca3af'}
                                />
                            </View>
                            <Text style={[styles.tabLabel, { color: isFocused ? '#526ff0ff' : '#9ca3af' }]}>
                                {label as string}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: 'white',
        width: width,
        height: 80,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    activeIconContainer: {
        backgroundColor: '#a0b6ffff', // Slightly darker blue background for active state
    },
    tabLabel: {
        fontSize: 10,
        marginTop: 4,
        fontWeight: '600',
    },
    centerButtonContainer: {
        width: 70,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -35, // Move up to float
    },
    centerButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#667eea',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#667eea',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 4,
        borderColor: '#f8f9fa', // Match background color to create "cutout" effect
    },
});
