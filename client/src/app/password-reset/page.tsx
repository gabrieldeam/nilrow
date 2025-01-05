import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function PasswordResetPage() {
  const { loading } = useAuth();

  if (loading) return <p>Carregando...</p>;

  return <h1>Password Reset</h1>;
}
