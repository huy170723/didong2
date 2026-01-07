// components/ui/collapsible.tsx

// Nếu lỗi module này, thay bằng:
import { useRef, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

export default function Collapsible({ 
  title, 
  children 
}: { 
  title: string; 
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleCollapse = () => {
    Animated.timing(animation, {
      toValue: isOpen ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsOpen(!isOpen);
  };

  const height = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200], // Thay 200 bằng chiều cao mong muốn
  });

  return (
    <View>
      <TouchableOpacity onPress={toggleCollapse}>
        <Text>{title}</Text>
      </TouchableOpacity>
      <Animated.View style={{ height, overflow: 'hidden' }}>
        {children}
      </Animated.View>
    </View>
  );
}