import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../supabase';

export default function ChatRoom({ route, navigation }) {
  const { forumId, forumName } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    navigation.setOptions({ title: forumName });
    setupChat();
  },[]);

  const setupChat = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user.id);

    // Fetch History
    const { data } = await supabase.from('forum_messages')
      .select('*, profiles(id, username, avatar_url)')
      .eq('forum_id', forumId).order('created_at', { ascending: true });
    if (data) setMessages(data);

    // Realtime Listener
    const channel = supabase.channel(`room_${forumId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'forum_messages', filter: `forum_id=eq.${forumId}` }, 
      async (payload) => {
        const { data: p } = await supabase.from('profiles').select('id, username, avatar_url').eq('id', payload.new.user_id).single();
        setMessages(prev =>[...prev, { ...payload.new, profiles: p }]);
      }).subscribe();

    return () => supabase.removeChannel(channel);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setInput('');
    await supabase.from('forum_messages').insert({ forum_id: forumId, user_id: userId, content: msg });
  };

  const renderMessage = ({ item }) => {
    const isMe = item.user_id === userId;
    return (
      <View style={[styles.msgWrapper, isMe ? styles.msgRight : styles.msgLeft]}>
        {!isMe && (
          <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { userId: item.profiles.id })}>
            <Image source={{ uri: item.profiles?.avatar_url }} style={styles.pfp} />
          </TouchableOpacity>
        )}
        <View style={isMe ? styles.bubbleMe : styles.bubbleOther}>
          {!isMe && <Text style={styles.senderName}>@{item.profiles?.username}</Text>}
          <Text style={{ color: isMe ? '#fff' : '#0f172a' }}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <FlatList data={messages} keyExtractor={i => i.id} renderItem={renderMessage} contentContainerStyle={{ padding: 15 }} />
      <View style={styles.inputBar}>
        <TextInput style={styles.input} placeholder="Type a message..." value={input} onChangeText={setInput} />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}><Ionicons name="send" size={18} color="#fff" /></TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  msgWrapper: { flexDirection: 'row', marginBottom: 15, alignItems: 'flex-end', maxWidth: '80%' },
  msgLeft: { alignSelf: 'flex-start' },
  msgRight: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  pfp: { width: 30, height: 30, borderRadius: 15, marginRight: 8 },
  bubbleMe: { backgroundColor: '#4f46e5', padding: 12, borderRadius: 18, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: '#fff', padding: 12, borderRadius: 18, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#e2e8f0' },
  senderName: { fontSize: 10, color: '#64748b', marginBottom: 4, fontWeight: 'bold' },
  inputBar: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#e2e8f0' },
  input: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 20, paddingHorizontal: 15, marginRight: 10 },
  sendBtn: { backgroundColor: '#4f46e5', width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center' }
});