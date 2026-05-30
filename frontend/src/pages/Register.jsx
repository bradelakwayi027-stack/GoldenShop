import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { authUtils } from '../utils/auth';
import './Auth.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // L'inscription retourne directement l'utilisateur et le token de session
      const { data } = await authService.register(name, email, password, role);
      authUtils.setAuth(data.token, data.user);
      
      if (data.user.role === 'vendeur') navigate('/vendor');
      else navigate('/shop');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <div className="premium-card auth-card" style={{ width: '100%', maxWidth: '450px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--primary)', fontSize: '2rem' }}>Inscription</h2>
        {error && <div className="error-message" style={{ color: 'var(--danger)', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Nom complet</label>
            <input
              type="text"
              style={{ width: '100%' }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Je suis...</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%' }}>
              <option value="client">Client (Acheter)</option>
              <option value="vendeur">Vendeur (Vendre)</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn-primary-solid" style={{ marginTop: '10px' }}>
            {loading ? 'Inscription...' : "S'inscrire"}
          </button>
        </form>
        <p className="auth-link" style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Déjà inscrit ? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
