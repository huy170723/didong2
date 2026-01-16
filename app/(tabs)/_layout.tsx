import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from "react";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#007AFF',
            }}
        >
            <Tabs.Screen
                name="index" // Giữ nguyên viết thường vì file là index.tsx
                options={{
                    title: 'Trang chủ',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="Search" // Đổi thành viết HOA vì file là Search.tsx
                options={{
                    title: 'Tìm kiếm',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="search" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="CreatePost" // Giữ nguyên viết HOA vì file là CreatePost.tsx
                options={{
                    title: 'Đăng tin',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="add-circle-outline" size={28} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="Favorite" // Đổi thành viết HOA vì file là Favorite.tsx
                options={{
                    title: 'Yêu thích',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="heart" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="Profile" // Đổi thành viết HOA vì file là Profile.tsx
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