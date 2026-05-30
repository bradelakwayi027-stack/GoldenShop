import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authUtils } from '../utils/auth';
import { authService } from '../services/api';
import { useCart } from '../context/CartContext';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const user = authUtils.getUser();
  const { cart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    authUtils.clearAuth();
    navigate('/login');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="header glass" style={{ position: 'sticky', top: 0, zIndex: 1000, padding: '14px 0', borderBottom: '1px solid var(--glass-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>

        {/* Logo */}
        <Link to="/" className="logo" onClick={closeMenu} style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--primary)', letterSpacing: '1px', flexShrink: 0 }}>
          ✨ GOLDEN <span style={{ color: 'white' }}>SHOP</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {!user ? (
            <>
              <Link to="/login" style={{ color: 'var(--text-main)', fontWeight: '500' }}>Connexion</Link>
              <Link to="/register" className="btn-primary-solid" style={{ padding: '8px 20px', borderRadius: '8px' }}>Inscription</Link>
            </>
          ) : (
            <>
              {authUtils.isAdmin() && <Link to="/admin" style={{ color: 'var(--primary)', fontWeight: '600' }}>Admin Panel</Link>}
              {authUtils.isVendor() && <Link to="/vendor" style={{ color: 'var(--primary)', fontWeight: '600' }}>Dashboard</Link>}
              {!authUtils.isVendor() && !authUtils.isAdmin() && <Link to="/my-orders" style={{ color: 'var(--text-main)' }}>Commandes</Link>}
              <Link to="/shop" style={{ color: 'var(--text-main)' }}>Catalogue</Link>

              <Link to="/checkout" style={{ position: 'relative', display: 'flex', alignItems: 'center', fontSize: '1.3rem' }}>
                🛒
                {cart.length > 0 && (
                  <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--primary)', color: 'black', borderRadius: '50%', padding: '2px 6px', fontSize: '0.65rem', fontWeight: 'bold' }}>
                    {cart.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </Link>

              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user?.name}</span>
              <button onClick={handleLogout} style={{ background: 'transparent', color: 'var(--danger)', fontSize: '0.85rem', padding: '4px 10px', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px' }}>Quitter</button>
            </>
          )}
        </nav>

        {/* Mobile: cart + hamburger */}
        <div className="nav-mobile-controls" style={{ display: 'none', alignItems: 'center', gap: '16px' }}>
          {user && (
            <Link to="/checkout" onClick={closeMenu} style={{ position: 'relative', fontSize: '1.4rem' }}>
              🛒
              {cart.length > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--primary)', color: 'black', borderRadius: '50%', padding: '1px 5px', fontSize: '0.6rem', fontWeight: 'bold' }}>
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </Link>
          )}
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.6rem', padding: '4px', lineHeight: 1 }}
            aria-label="Menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="mobile-menu" style={{
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--glass-border)',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {!user ? (
            <>
              <Link to="/login" onClick={closeMenu} style={{ color: 'var(--text-main)', fontWeight: '500', fontSize: '1.05rem' }}>Connexion</Link>
              <Link to="/register" onClick={closeMenu} className="btn-primary-solid" style={{ padding: '12px 20px', textAlign: 'center' }}>Inscription</Link>
            </>
          ) : (
            <>
              {authUtils.isAdmin() && <Link to="/admin" onClick={closeMenu} style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '1.05rem' }}>⚙️ Admin Panel</Link>}
              {authUtils.isVendor() && <Link to="/vendor" onClick={closeMenu} style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '1.05rem' }}>🏪 Dashboard Vendeur</Link>}
              {!authUtils.isVendor() && !authUtils.isAdmin() && <Link to="/my-orders" onClick={closeMenu} style={{ color: 'var(--text-main)', fontSize: '1.05rem' }}>📦 Mes Commandes</Link>}
              <Link to="/shop" onClick={closeMenu} style={{ color: 'var(--text-main)', fontSize: '1.05rem' }}>🛍️ Catalogue</Link>
              <div style={{ height: '1px', background: 'var(--glass-border)' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Connecté en tant que: <strong style={{ color: 'white' }}>{user?.name}</strong></span>
              <button onClick={handleLogout} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', fontSize: '1rem', padding: '10px', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', textAlign: 'left' }}>
                🚪 Se déconnecter
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
