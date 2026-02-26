import 'react-native-url-polyfill/auto'; // React Native mein URL fix karne ke liye
import { createClient } from '@supabase/supabase-js';

// TERA EXACT SAHI DATA
const S_URL = "https://cctrgxbnntwjmjvxtnpk.supabase.co"; 
const S_KEY = "sb_publishable_3N6MyW8hgvFcJg5zyqj5xA_OtYygV2H";

export const supabase = createClient(S_URL, S_KEY);