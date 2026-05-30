import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { authUtils } from '../utils/auth';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await authService.login(email, password);
      authUtils.setAuth(data.token, data.user);
      
      // Redirect selon le rôle
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'vendeur') navigate('/vendor');
      else navigate('/shop');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="premium-card auth-card" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--primary)', fontSize: '2rem' }}>Connexion</h2>
        {error && <div className="error-message" style={{ color: 'var(--danger)', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Email</label>
            <input
              type="email"
              style={{ width: '100%' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Mot de passe</label>
            <input
              type="password"
              style={{ width: '100%' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary-solid">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p className="auth-link" style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Pas de compte ? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}
