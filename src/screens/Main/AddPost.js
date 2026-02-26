import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../supabase';

export default function AddPost({ navigation }) {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.6 });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const publishPost = async () => {
    if (!image || !caption) return Alert.alert("Required", "Please select an image and write a caption.");
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const fileName = `${user.id}_${Date.now()}.png`;
      const base64 = await FileSystem.readAsStringAsync(image, { encoding: 'base64' });

      // Upload to post-images bucket
      const { error: upErr } = await supabase.storage.from('post-images').upload(fileName, decode(base64), { contentType: 'image/png' });
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(fileName);

      // Insert to Posts table
      const { error: dbErr } = await supabase.from('posts').insert({
        user_id: user.id, caption: caption, image_url: publicUrl
      });
      if (dbErr) throw dbErr;

      Alert.alert("Success", "Post published!");
      setImage(null); setCaption('');
      navigation.navigate('Home'); // Wapas feed par bhej do
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Post</Text>
      
      <TouchableOpacity style={styles.imgBox} onPress={pickImage}>
        {image ? <Image source={{ uri: image }} style={styles.img} /> : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={40} color="#94a3b8" />
            <Text style={{color:'#64748b', marginTop:10}}>Tap to select notes/doubt photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput style={styles.input} placeholder="Write a caption... (e.g., Please solve this)" placeholderTextColor="#94a3b8" multiline value={caption} onChangeText={setCaption} />

      <TouchableOpacity style={styles.btn} onPress={publishPost} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.btnText}>Publish</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#0f172a' },
  imgBox: { width: '100%', height: 250, backgroundColor: '#f1f5f9', borderRadius: 16, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed' },
  img: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, padding: 15, height: 100, textAlignVertical: 'top', color: '#0f172a', marginBottom: 20 },
  btn: { backgroundColor: '#4f46e5', padding: 18, borderRadius: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
