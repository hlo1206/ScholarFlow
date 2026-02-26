import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../../supabase';

export default function UserProfile({ route }) {
  const { userId } = route.params;
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const[loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  },[]);

  const fetchUserDetails = async () => {
    // 1. Fetch Profile Info
    const { data: pData } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(pData);

    // 2. Fetch their Posts
    const { data: psts } = await supabase.from('posts').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    setUserPosts(psts ||[]);
    setLoading(false);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4f46e5" /></View>;

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Image source={{ uri: profile?.avatar_url }} style={styles.avatar} />
        <Text style={styles.name}>{profile?.full_name}</Text>
        <Text style={styles.handle}>@{profile?.username}</Text>
        <Text style={styles.bio}>{profile?.bio || "This student hasn't added a bio yet."}</Text>
        
        <View style={styles.stats}>
          <View style={styles.statBox}><Text style={styles.statNum}>{userPosts.length}</Text><Text style={styles.statLabel}>Posts</Text></View>
        </View>
      </View>

      {/* Grid of Posts */}
      <FlatList
        data={userPosts}
        numColumns={3}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <Image source={{ uri: item.image_url }} style={styles.gridImage} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#fff' },
  header: { alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: '#e2e8f0' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#4f46e5', marginBottom: 10 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  handle: { fontSize: 14, color: '#64748b', marginBottom: 10 },
  bio: { textAlign: 'center', color: '#334155', paddingHorizontal: 20 },
  stats: { flexDirection: 'row', marginTop: 20 },
  statBox: { alignItems: 'center', marginHorizontal: 15 },
  statNum: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  statLabel: { fontSize: 12, color: '#64748b' },
  gridImage: { flex: 1/3, height: 120, margin: 1, backgroundColor: '#e2e8f0' }
});
