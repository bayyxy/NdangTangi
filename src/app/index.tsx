// src/app/index.tsx - pengarah awal berdasarkan status sesi
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function Root() {
  const { session, isLoading } = useAuth();

  if (isLoading) return null;

  return <Redirect href={session ? '/(tabs)' : '/(auth)/login'} />;
}
