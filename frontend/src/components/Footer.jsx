import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" style={{ marginTop: '80px', background: 'var(--glass)', borderTop: '1px solid var(--glass-border)', padding: '60px 0 20px' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div className="footer-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          <div className="footer-section">
            <h4 style={{ color: 'var(--primary)', marginBottom: '16px' }}>À propos</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>GOLDEN SHOP est la plateforme de référence pour le commerce multi-vendeurs en RDC.</p>
          </div>
          <div className="footer-section">
            <h4 style={{ color: 'var(--primary)', marginBottom: '16px' }}>Liens utiles</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}><Link to="/contact" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Contact</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/faq" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>FAQ</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Conditions</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Nous suivre</h4>
            <div className="social-links">
              <a href="#">Facebook</a>
              <a href="#">Twitter</a>
              <a href="#">Instagram</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>&copy; 2026 GOLDEN SHOP. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
