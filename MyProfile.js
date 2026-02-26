import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../supabase';

export default function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyDetails();
  },[]);

  const fetchMyDetails = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch Profile
    const { data: pData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(pData);

    // Fetch My Posts
    const { data: psts } = await supabase.from('posts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setMyPosts(psts ||[]);
    
    setLoading(false);
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?",[
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: async () => await supabase.auth.signOut() }
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4f46e5" /></View>;

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>

        <Image source={{ uri: profile?.avatar_url }} style={styles.avatar} />
        <Text style={styles.name}>{profile?.full_name}</Text>
        <Text style={styles.handle}>@{profile?.username}</Text>
        <Text style={styles.bio}>{profile?.bio || "You haven't added a bio yet."}</Text>
        
        <View style={styles.stats}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{myPosts.length}</Text>
            <Text style={styles.statLabel}>My Posts</Text>
          </View>
        </View>
      </View>

      {/* Grid of My Posts */}
      <FlatList
        data={myPosts}
        numColumns={3}
        keyExtractor={i => i.id.toString()}
        renderItem={({ item }) => (
          <Image source={{ uri: item.image_url }} style={styles.gridImage} />
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>You haven't posted anything yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#fff' },
  header: { alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: '#e2e8f0', paddingTop: 40 },
  logoutBtn: { position: 'absolute', top: 20, right: 20, padding: 5 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#4f46e5', marginBottom: 10 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  handle: { fontSize: 14, color: '#64748b', marginBottom: 10 },
  bio: { textAlign: 'center', color: '#334155', paddingHorizontal: 20, fontStyle: 'italic' },
  stats: { flexDirection: 'row', marginTop: 20 },
  statBox: { alignItems: 'center', marginHorizontal: 15 },
  statNum: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  statLabel: { fontSize: 12, color: '#64748b' },
  gridImage: { flex: 1/3, height: 120, margin: 1, backgroundColor: '#e2e8f0' },
  emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: 50 }
});