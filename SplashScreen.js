import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image, StatusBar } from 'react-native';

export default function SplashScreen() {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true })
    ]).start();
  },[]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: fadeAnim, alignItems: 'center' }}>
        <Image 
          source={{ uri: 'https://i.ibb.co/vvJSCg6k/Generated-Image-February-25-2026-12-11-PM.png' }} 
          style={styles.logo} 
        />
        <Text style={styles.brandText}>
          Scholar<Text style={styles.highlight}>Flow</Text>
        </Text>
        <Text style={styles.tagline}>Smart Study Community</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  logo: { width: 120, height: 120, resizeMode: 'contain', marginBottom: 15 },
  brandText: { fontSize: 32, fontWeight: '900', color: '#0f172a', letterSpacing: 1 },
  highlight: { color: '#4f46e5' }, 
  tagline: { color: '#64748b', fontSize: 12, marginTop: 5, textTransform: 'uppercase', letterSpacing: 2, fontWeight: '600' }
});