import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../supabase';

export default function HomeFeed({ navigation }) {
  const [posts, setPosts] = useState([]);
  const[loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  },[]);

  const fetchPosts = async () => {
    // Left join lagaya hai taaki user detail post ke saath aayein
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(id, username, avatar_url, full_name)')
      .order('created_at', { ascending: false });

    if (!error) setPosts(data);
    setLoading(false);
  };

  const handleAIAnalyse = (imageUrl, caption) => {
    // Ye button seedha "AI Tutor" tab par bhejega special params ke saath
    navigation.navigate('AI Tutor', { analyzeImage: imageUrl, analyzeCaption: caption });
  };

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      {/* Header: Click to open Profile */}
      <TouchableOpacity 
        style={styles.header} 
        onPress={() => navigation.navigate('UserProfile', { userId: item.profiles.id })}
      >
        <Image source={{ uri: item.profiles.avatar_url }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.name}>{item.profiles.full_name}</Text>
          <Text style={styles.handle}>@{item.profiles.username}</Text>
        </View>
        <Ionicons name="ellipsis-vertical" size={20} color="#94a3b8" />
      </TouchableOpacity>

      {/* Post Image */}
      <Image source={{ uri: item.image_url }} style={styles.postImage} />

      {/* Action Bar */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="heart-outline" size={26} color="#0f172a" />
          <Text style={styles.iconText}>{item.likes_count}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="chatbubble-outline" size={24} color="#0f172a" />
        </TouchableOpacity>
        
        {/* AI Analyse Button (Sparkles) */}
        <TouchableOpacity 
          style={styles.aiBtn} 
          onPress={() => handleAIAnalyse(item.image_url, item.caption)}
        >
          <Ionicons name="sparkles" size={16} color="#fff" />
          <Text style={styles.aiBtnText}>AI Analyze</Text>
        </TouchableOpacity>
      </View>

      {/* Caption */}
      <Text style={styles.caption}>
        <Text style={{ fontWeight: 'bold' }}>{item.profiles.username} </Text>
        {item.caption}
      </Text>
    </View>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4f46e5" /></View>;

  return (
    <View style={styles.container}>
      {/* Top Bar Logo */}
      <View style={styles.topBar}>
        <Text style={styles.brand}>Scholar<Text style={{ color: '#4f46e5' }}>Flow</Text></Text>
        <Ionicons name="notifications-outline" size={24} color="#0f172a" />
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchPosts}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  brand: { fontSize: 20, fontWeight: '900', fontStyle: 'italic', color: '#0f172a' },
  postCard: { backgroundColor: '#fff', marginBottom: 10, paddingVertical: 10 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  userInfo: { flex: 1 },
  name: { fontWeight: 'bold', fontSize: 14, color: '#0f172a' },
  handle: { fontSize: 12, color: '#64748b' },
  postImage: { width: '100%', height: 350, resizeMode: 'cover', backgroundColor: '#e2e8f0' },
  actions: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10 },
  iconBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  iconText: { marginLeft: 5, fontWeight: 'bold', color: '#0f172a' },
  aiBtn: { marginLeft: 'auto', backgroundColor: '#4f46e5', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  aiBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 5 },
  caption: { paddingHorizontal: 15, color: '#334155', fontSize: 14, lineHeight: 20 }
});