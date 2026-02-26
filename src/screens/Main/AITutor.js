import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { callAIAPI } from '../../api';

export default function AITutor({ route }) {
  const [messages, setMessages] = useState([
    { id: '1', role: 'ai', text: 'Namaste! Main ScholarFlow AI hoon. Pucho bhai kya doubt hai?' }
  ]);
  const [input, setInput] = useState('');
  const[loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Check if someone clicked "AI Analyse" from HomeFeed
  useEffect(() => {
    if (route.params?.analyzeImage) {
      const { analyzeImage, analyzeCaption } = route.params;
      const initialPrompt = `Bhai, is post ka caption hai: "${analyzeCaption}". Aur ye image hai: ${analyzeImage}. Ise analyze karke samjhao.`;
      
      // Auto trigger AI
      sendMessage(initialPrompt, analyzeImage);
    }
  }, [route.params]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, quality: 0.5,
    });
    if (!result.canceled) setSelectedImage(result.assets[0].uri);
  };

  const sendMessage = async (customPrompt = null, imageUrl = null) => {
    const textToSend = customPrompt || input;
    if (!textToSend && !selectedImage && !imageUrl) return;

    // Add user message to UI
    const newUserMsg = { id: Date.now().toString(), role: 'user', text: textToSend, image: selectedImage || imageUrl };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setLoading(true);

    // Prepare Base64 Image if attached
    let base64Image = null;
    if (selectedImage) {
      base64Image = await FileSystem.readAsStringAsync(selectedImage, { encoding: 'base64' });
      setSelectedImage(null); // Clear after sending
    }

    // Prepare History (Only last 6 messages to save data)
    const history = messages.slice(-6).map(m => ({ role: m.role === 'ai' ? 'model' : 'user', text: m.text }));

    // Call Vercel Backend
    const response = await callAIAPI(textToSend, history, base64Image);

    setLoading(false);
    if (response.answer) {
      setMessages(prev =>[...prev, { id: Date.now().toString(), role: 'ai', text: response.answer }]);
    } else {
      setMessages(prev =>[...prev, { id: Date.now().toString(), role: 'ai', text: "Error: AI so gaya hai, phir try karo." }]);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ScholarFlow AI <Text style={{fontSize: 10, color: '#10b981'}}>● ONLINE</Text></Text>
        <TouchableOpacity onPress={() => setMessages([])}><Ionicons name="trash-outline" size={20} color="#ef4444" /></TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 15 }}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleAI]}>
            {item.image && <Image source={{ uri: item.image }} style={styles.attachedImage} />}
            <Text style={{ color: item.role === 'user' ? '#fff' : '#0f172a' }}>{item.text}</Text>
          </View>
        )}
      />

      {loading && <Text style={styles.loadingText}>AI is typing...</Text>}

      {/* Image Preview before sending */}
      {selectedImage && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: selectedImage }} style={styles.previewImg} />
          <TouchableOpacity style={styles.previewClose} onPress={() => setSelectedImage(null)}><Ionicons name="close" size={16} color="white" /></TouchableOpacity>
        </View>
      )}

      <View style={styles.inputArea}>
        <TouchableOpacity onPress={pickImage} style={styles.iconBtn}>
          <Ionicons name="camera-outline" size={28} color="#64748b" />
        </TouchableOpacity>
        <TextInput 
          style={styles.input} 
          placeholder="Ask a doubt or upload photo..." 
          value={input} 
          onChangeText={setInput} 
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={() => sendMessage()} disabled={loading}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e2e8f0' },
  headerTitle: { fontWeight: 'bold', fontSize: 16, color: '#0f172a' },
  bubble: { maxWidth: '85%', padding: 12, borderRadius: 16, marginBottom: 10 },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: '#4f46e5', borderBottomRightRadius: 4 },
  bubbleAI: { alignSelf: 'flex-start', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderBottomLeftRadius: 4 },
  attachedImage: { width: 200, height: 200, borderRadius: 10, marginBottom: 10 },
  loadingText: { marginLeft: 15, color: '#64748b', fontStyle: 'italic', fontSize: 12 },
  previewContainer: { padding: 10, flexDirection: 'row' },
  previewImg: { width: 50, height: 50, borderRadius: 8 },
  previewClose: { position: 'absolute', top: 5, left: 45, backgroundColor: 'red', borderRadius: 10, padding: 2 },
  inputArea: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#e2e8f0' },
  input: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 20, paddingHorizontal: 15, paddingTop: 10, paddingBottom: 10, maxHeight: 100, marginHorizontal: 10 },
  iconBtn: { padding: 5 },
  sendBtn: { backgroundColor: '#4f46e5', width: 45, height: 45, borderRadius: 25, justifyContent: 'center', ali
