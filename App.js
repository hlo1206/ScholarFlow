import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from './src/supabase';

// --- AUTH SCREENS ---
import SplashScreen from './src/screens/Auth/SplashScreen';
import LoginScreen from './src/screens/Auth/LoginScreen';
import OtpScreen from './src/screens/Auth/OtpScreen';
import ProfileSetup from './src/screens/Auth/ProfileSetup';

// --- MAIN SCREENS ---
import HomeFeed from './src/screens/Main/HomeFeed';
// (Baki files hum agle steps mein banayenge, tab tak dummy component)
const ForumsList = () => <View><Text>Forums</Text></View>;
const AddPost = () => <View><Text>Add Post</Text></View>;
const AITutor = () => <View><Text>AI Tutor</Text></View>;
const MyProfile = () => <View><Text>My Profile</Text></View>;
const ChatRoom = () => <View><Text>Chat Room</Text></View>;
const UserProfile = () => <View><Text>Other User Profile</Text></View>;

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { backgroundColor: '#ffffff', height: 60, paddingBottom: 10, paddingTop: 5, borderTopColor: '#f1f5f9' },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Forums') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          else if (route.name === 'AI Tutor') iconName = focused ? 'hardware-chip' : 'hardware-chip-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          else if (route.name === 'Add') return <Ionicons name="add-circle" size={40} color="#4f46e5" style={{ marginTop: -5 }} />;
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeFeed} />
      <Tab.Screen name="Forums" component={ForumsList} />
      <Tab.Screen name="Add" component={AddPost} options={{ tabBarLabel: '' }} />
      <Tab.Screen name="AI Tutor" component={AITutor} />
      <Tab.Screen name="Profile" component={MyProfile} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const[isReady, setIsReady] = useState(false);
  const [hasProfile, setHasProfile] = useState(true);

  useEffect(() => {
    checkUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => checkUser(session));
    return () => listener.subscription.unsubscribe();
  },[]);

  const checkUser = async (currentSession = null) => {
    const s = currentSession || (await supabase.auth.getSession()).data.session;
    setSession(s);
    if (s) {
      const { data } = await supabase.from('profiles').select('id').eq('id', s.user.id).single();
      setHasProfile(!!data);
    }
    setTimeout(() => setIsReady(true), 1500); // Wait for Splash Screen
  };

  if (!isReady) return <SplashScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          // AUTH STACK
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} />
          </>
        ) : !hasProfile ? (
          // PROFILE SETUP STACK
          <Stack.Screen name="ProfileSetup" component={ProfileSetup} />
        ) : (
          // MAIN APP STACK (Tabs + Full Screen Pages)
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="ChatRoom" component={ChatRoom} options={{ headerShown: true, title: 'Chat' }} />
            <Stack.Screen name="UserProfile" component={UserProfile} options={{ headerShown: true, title: 'Student Profile' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}