import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../supabase';

export default function ForumsList({ navigation }) {
  const[forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const[newForumName, setNewForumName] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');

  useEffect(() => {
    fetchForums();
  },[]);

  const fetchForums = async () => {
    const { data } = await supabase.from('forums').select('*').order('created_at', { ascending: false });
    if (data) setForums(data);
    setLoading(false);
  };

  const createForum = async () => {
    if (!newForumName) return;
    const { data: { user } } = await supabase.auth.getUser();
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase(); // Random 6 char code
    
    const { error } = await supabase.from('forums').insert({ 
      name: newForumName, created_by: user.id, invite_code: inviteCode 
    });

    if (!error) {
      setNewForumName('');
      fetchForums();
      Alert.alert("Forum Created", `Your Invite Code is: ${inviteCode}`);
    } else Alert.alert("Error", error.message);
  };

  const joinByCode = async () => {
    if (!inviteCodeInput) return;
    const { data, error } = await supabase.from('forums').select('*').eq('invite_code', inviteCodeInput).single();
    if (data) {
      setInviteCodeInput('');
      navigation.navigate('ChatRoom', { forumId: data.id, forumName: data.name });
    } else {
      Alert.alert("Not Found", "Invalid Invite Code!");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.title}>Study Forums</Text>
        
        {/* Create Forum */}
        <View style={styles.inputRow}>
          <TextInput style={styles.input} placeholder="New Group Name..." value={newForumName} onChangeText={setNewForumName} />
          <TouchableOpacity style={styles.actionBtn} onPress={createForum}><Ionicons name="add" size={24} color="#fff" /></TouchableOpacity>
        </View>

        {/* Join by Code */}
        <View style={styles.inputRow}>
          <TextInput style={styles.input} placeholder="Enter Invite Code (e.g. AB12XY)" value={inviteCodeInput} onChangeText={setInviteCodeInput} autoCapitalize="characters" />
          <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#10b981'}]} onPress={joinByCode}><Ionicons name="enter" size={20} color="#fff" /></TouchableOpacity>
        </View>
      </View>

      {loading ? <ActivityIndicator size="large" color="#4f46e5" style={{marginTop: 50}}/> : (
        <FlatList
          data={forums}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 15 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.forumCard} 
              onPress={() => navigation.navigate('ChatRoom', { forumId: item.id, forumName: item.name })}
            >
              <View style={styles.forumIcon}><Text style={styles.iconText}>#</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.forumName}>{item.name}</Text>
                <Text style={styles.forumCode}>Code: {item.invite_code}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  topSection: { padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e2e8f0' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 15 },
  inputRow: { flexDirection: 'row', marginBottom: 10, gap: 10 },
  input: { flex: 1, backgroundColor: '#f1f5f9', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  actionBtn: { backgroundColor: '#4f46e5', width: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  forumCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  forumIcon: { width: 40, height: 40, backgroundColor: '#e0e7ff', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  iconText: { color: '#4f46e5', fontSize: 20, fontWeight: 'bold' },
  forumName: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  forumCode: { fontSize: 11, color: '#64748b', marginTop: 2 }
});