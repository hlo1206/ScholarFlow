import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { callAuthAPI } from '../../api';
import { supabase } from '../../supabase';

export default function OtpScreen({ route, navigation }) {
  const { email } = route.params; // LoginScreen se email yahan aayega
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (token.length < 6) return Alert.alert("Invalid", "Bhai, 6 digit ka OTP dalo.");
    setLoading(true);

    const data = await callAuthAPI(email, '', 'verify', token);

    if (data.error || data.error_description) {
      Alert.alert("Wrong OTP", data.error_description || data.error);
    } else {
      // OTP Sahi hai, session save karo
      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token
      });
      // App.js isko khud detect karke Home par bhej dega
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check Email</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code sent to {email}</Text>
      
      <TextInput 
        style={styles.input} 
        placeholder="000000" 
        placeholderTextColor="#94a3b8"
        keyboardType="number-pad" 
        maxLength={6} 
        value={token} 
        onChangeText={setToken}
      />

      <TouchableOpacity style={styles.mainBtn} onPress={handleVerify} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify Code</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Wrong email? Go back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 24, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#0f172a', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 30, textAlign: 'center' },
  input: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, padding: 20, fontSize: 32, color: '#4f46e5', textAlign: 'center', letterSpacing: 10, fontWeight: 'bold', marginBottom: 20 },
  mainBtn: { backgroundColor: '#4f46e5', padding: 18, borderRadius: 16, alignItems: 'center' },
  btnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  backBtn: { marginTop: 20, alignItems: 'center' },
  backText: { color: '#64748b', fontSize: 14 }
});