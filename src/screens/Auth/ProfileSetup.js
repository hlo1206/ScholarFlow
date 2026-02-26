import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../../supabase';

export default function ProfileSetup() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.5,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const saveProfile = async () => {
    if (!name || !username) return Alert.alert("Required", "Full Name and Username are mandatory.");
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      let avatarUrl = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

      if (image) {
        const fileName = `${user.id}_${Date.now()}.png`;
        const base64 = await FileSystem.readAsStringAsync(image, { encoding: 'base64' });
        const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, decode(base64), { contentType: 'image/png' });
        
        if (!uploadError) {
          avatarUrl = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl;
        }
      }

      const { error } = await supabase.from('profiles').upsert({
        id: user.id, full_name: name, username: username.toLowerCase(), bio: bio, avatar_url: avatarUrl
      });

      if (error) throw error;
      // Reload page (App.js will automatically send to Home)
      Alert.alert("Success", "Profile Ready!");
      supabase.auth.refreshSession(); 
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Setup Profile</Text>
      
      <TouchableOpacity onPress={pickImage} style={styles.imgContainer}>
        <Image source={{ uri: image || "https://cdn-icons-png.flaticon.com/512/149/149071.png" }} style={styles.img} />
        <Text style={styles.imgText}>Upload Photo</Text>
      </TouchableOpacity>

      <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#94a3b8" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Username (@unique)" placeholderTextColor="#94a3b8" value={username} onChangeText={setUsername} />
      <TextInput style={[styles.input, { height: 80 }]} placeholder="Bio / Description" placeholderTextColor="#94a3b8" multiline value={bio} onChangeText={setBio} />

      <TouchableOpacity style={styles.btn} onPress={saveProfile} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Finish Setup</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 24, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#0f172a', marginBottom: 30, textAlign: 'center' },
  imgContainer: { alignItems: 'center', marginBottom: 30 },
  img: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#4f46e5' },
  imgText: { color: '#4f46e5', fontWeight: 'bold', marginTop: 10 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', padding: 15, borderRadius: 12, marginBottom: 15, color: '#0f172a' },
  btn: { backgroundColor: '#4f46e5', padding: 18, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
