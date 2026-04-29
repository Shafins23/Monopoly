import React, { useState, useEffect } from 'react';
import { auth } from './lib/firebase';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import Lobby from './components/Lobby';
import GameRoom from './components/GameRoom';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setIsLoading(false);
        setAuthError(null);
      } else {
        signInAnonymously(auth).catch((error) => {
          console.error(error);
          if (error.code === 'auth/admin-restricted-operation' || error.code === 'auth/operation-not-allowed') {
            setAuthError('Anonymous Authentication is not enabled. Please enable it in the Firebase Console: Build > Authentication > Sign-in method > Anonymous.');
          } else if (error.code === 'auth/network-request-failed') {
            setAuthError('Network error: Unable to connect to Firebase. Please check your internet connection or disable any ad-blockers/privacy extensions that might be blocking Firebase.');
          } else {
            setAuthError(error.message);
          }
          setIsLoading(false);
        });
      }
    });

    // Check URL for room code
    const hash = window.location.hash;
    if (hash.startsWith('#room=')) {
      setRoomId(hash.replace('#room=', ''));
    }

    return unsubscribe;
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-emerald-500 animate-pulse font-serif text-2xl italic">
          Loading Monopoly...
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-[#0E1B1B] flex flex-col items-center justify-center p-6 text-center text-white">
        <h2 className="text-red-500 text-2xl font-bold mb-4">Authentication Error</h2>
        <p className="max-w-md text-emerald-100/70">{authError}</p>
      </div>
    );
  }

  if (roomId) {
    return <GameRoom roomId={roomId} user={user!} onExit={() => { setRoomId(null); window.history.pushState(null, '', '/'); }} />;
  }

  return (
    <Lobby 
      user={user!} 
      onJoin={(id) => { 
        setRoomId(id); 
        window.history.pushState(null, '', `#room=${id}`);
      }} 
    />
  );
}
