import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ActivityIndicator, Alert } from 'react-native';
import { callAuthAPI } from '../../api';
import { supabase } from '../../supabase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const[isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    if (!email || !password) return Alert.alert("Hold on!", "Bhai, Email aur Password toh dalo.");
    setLoading(true);

    const type = isLogin ? 'login' : 'signup';
    const data = await callAuthAPI(email, password, type);

    if (data.error || data.error_description) {
      Alert.alert("Oops!", data.error_description || data.error);
    } else {
      if (!isLogin) {
        Alert.alert("Success", "OTP email par bhej diya hai!");
        navigation.navigate('Otp', { email }); // Go to OTP screen
      } else {
        // Login Success -> Save session to device
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token
        });
        // App.js listener will auto-redirect to Home
      }
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{isLogin ? "Welcome back" : "Create Account"}</Text>
        <Text style={styles.subtitle}>{isLogin ? "Log in to access your feed." : "Join ScholarFlow today."}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput 
          style={styles.input} placeholder="student@example.com" placeholderTextColor="#94a3b8"
          autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput 
          style={styles.input} placeholder="••••••••" placeholderTextColor="#94a3b8"
          secureTextEntry value={password} onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.mainBtn} onPress={handleAuth} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{isLogin ? "Log In" : "Sign Up"}</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.toggleBtn} onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.toggleText}>
            {isLogin ? "New student? " : "Already registered? "}
            <Text style={styles.linkText}>{isLogin ? "Sign Up" : "Log In"}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 24, justifyContent: 'center' },
  header: { marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#64748b' },
  form: { width: '100%' },
  label: { fontSize: 12, fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: 6, marginLeft: 4 },
  input: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, padding: 16, fontSize: 16, color: '#0f172a', marginBottom: 20 },
  mainBtn: { backgroundColor: '#4f46e5', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  toggleBtn: { marginTop: 24, alignItems: 'center' },
  toggleText: { color: '#64748b', fontSize: 14 },
  linkText: { color: '#4f46e5', fontWeight: 'bold' }
});
