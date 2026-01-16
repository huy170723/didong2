import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from "react";
import { Platform } from 'react-native';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#007AFF',
                tabBarStyle: Platform.OS === 'web' ? {
                    boxShadow: '0px -1px 5px rgba(0,0,0,0.1)', // Cách viết boxShadow chuẩn cho Web
                    borderTopWidth: 0,
                } : {},
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Trang chủ',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="Search"
                options={{
                    title: 'Tìm kiếm',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="search" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="Deposit"
                options={{
                    title: 'Đặt cọc',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="wallet-outline" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="Favorite"
                options={{
                    title: 'Yêu thích',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="heart" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="Profile"
                options={{
                    title: 'Tài khoản',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}