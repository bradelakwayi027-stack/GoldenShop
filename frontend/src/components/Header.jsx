import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authUtils } from '../utils/auth';
import { authService } from '../services/api';
import { useCart } from '../context/CartContext';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const user = authUtils.getUser();
  const { cart } = useCart();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    authUtils.clearAuth();
    navigate('/login');
  };

  return (
    <header className="header glass" style={{ position: 'sticky', top: 0, zIndex: 1000, padding: '16px 0', borderBottom: '1px solid var(--glass-border)' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <Link to="/" className="logo" style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)', letterSpacing: '1px' }}>
          ✨ GOLDEN <span style={{ color: 'white' }}>SHOP</span>
        </Link>
        <nav className="nav" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {!user ? (
            <>
              <Link to="/login" style={{ color: 'var(--text-main)', fontWeight: '500' }}>Connexion</Link>
              <Link to="/register" className="btn-primary-solid" style={{ padding: '8px 20px', borderRadius: '8px' }}>Inscription</Link>
            </>
          ) : (
            <>
              {authUtils.isAdmin() && <Link to="/admin" style={{ color: 'var(--primary)', fontWeight: '600' }}>Admin Panel</Link>}
              {authUtils.isVendor() && <Link to="/vendor" style={{ color: 'var(--primary)', fontWeight: '600' }}>Dashboard Vendeur</Link>}
              {!authUtils.isVendor() && !authUtils.isAdmin() && <Link to="/my-orders" style={{ color: 'var(--text-main)' }}>Mes Commandes</Link>}
              <Link to="/shop" style={{ color: 'var(--text-main)' }}>Catalogue</Link>
              
              <Link to="/checkout" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                🛒
                {cart.length > 0 && (
                  <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--primary)', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                    {cart.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </Link>

              <div style={{ height: '24px', width: '1px', background: 'var(--glass-border)' }}></div>
              
              <span className="user-info" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user?.name}</span>
              <button onClick={handleLogout} style={{ background: 'transparent', color: 'var(--danger)', fontSize: '0.9rem', padding: '4px 8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>Quitter</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

