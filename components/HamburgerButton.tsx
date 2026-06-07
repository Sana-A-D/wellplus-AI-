import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Menu } from 'lucide-react-native';
import { useSidebar } from './SidebarContext';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  /** Optional additional style override */
  style?: object;
}

export default function HamburgerButton({ style }: Props) {
  const { toggleSidebar } = useSidebar();
  const { colors, isDark } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor: isDark ? '#1F2937' : '#F1F5F9' },
        style,
      ]}
      onPress={toggleSidebar}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Menu size={20} color={colors.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
