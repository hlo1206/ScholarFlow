// TERA VERCEL URL
const VERCEL_BASE = "https://scholar-flow-backend1.vercel.app";

// 1. Auth Proxy Call
export const callAuthAPI = async (email, password, type, token = null) => {
  try {
    const res = await fetch(`${VERCEL_BASE}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, type, token })
    });
    return await res.json();
  } catch (error) {
    return { error: "Network Error! Vercel connect nahi ho raha." };
  }
};

// 2. AI Chat Call
export const callAIAPI = async (prompt, history =[]) => {
  try {
    const res = await fetch(`${VERCEL_BASE}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, history })
    });
    return await res.json();
  } catch (error) {
    return { error: "AI Server down hai." };
  }
};
