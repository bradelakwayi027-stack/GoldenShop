import React from 'react';
import { Link } from 'react-router-dom';
import { authUtils } from '../utils/auth';
import './Home.css';

export default function Home() {
  const isLoggedIn = authUtils.isLoggedIn();
  const user = authUtils.getUser();

  return (
    <div className="home" style={{ color: 'white' }}>
      {/* Hero Section */}
      <section className="hero" style={{ 
        padding: '120px 20px', 
        textAlign: 'center', 
        background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.1) 0%, transparent 70%)'
      }}>
        <div className="hero-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '4rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px' }}>
            L'Excellence du <span style={{ color: 'var(--primary)' }}>E-Commerce</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '40px' }}>
            La plateforme de référence pour le commerce premium en République Démocratique du Congo.
          </p>
          <div className="hero-buttons" style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            {!isLoggedIn ? (
              <>
                <Link to="/login" className="btn-primary-solid" style={{ padding: '16px 32px' }}>Se connecter</Link>
                <Link to="/register" style={{ padding: '16px 32px', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>S'inscrire</Link>
              </>
            ) : (
              <Link to="/shop" className="btn-primary-solid" style={{ padding: '16px 32px' }}>Explorer le Catalogue</Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" style={{ padding: '80px 20px' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '48px', fontSize: '2.5rem' }}>Pourquoi nous choisir ?</h2>
          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {[
              { icon: '💎', title: 'Qualité Premium', desc: 'Une sélection rigoureuse des boutiques et des produits.' },
              { icon: '💸', title: 'Paiements Locaux', desc: 'M-Pesa, Airtel, Orange Money et Visa acceptés.' },
              { icon: '🚀', title: 'Vitesse Éclair', desc: 'Une expérience fluide et rapide sur tous vos appareils.' },
              { icon: '🛡️', title: 'Sécurité Totale', desc: 'Vos transactions et données sont protégées par les meilleurs protocoles.' }
            ].map((f, i) => (
              <div key={i} className="premium-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{f.icon}</div>
                <h3 style={{ marginBottom: '12px', color: 'var(--primary)' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 20px', background: 'var(--bg-card)' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '48px', fontSize: '2.5rem' }}>Comment ça fonctionne</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {[
              { role: 'Client', steps: ['Inscrivez-vous', 'Ajoutez au panier', 'Payez via Mobile Money', 'Recevez vos articles'] },
              { role: 'Vendeur', steps: ['Créez votre boutique', 'Attendez l\'approbation', 'Ajoutez vos produits', 'Encaissez vos ventes'] }
            ].map((r, i) => (
              <div key={i} className="glass" style={{ padding: '32px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '2rem', color: 'var(--primary)', flex: '1' }}>{r.role}</h3>
                <div style={{ flex: '3', display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                  {r.steps.map((s, j) => (
                    <div key={j} style={{ textAlign: 'center' }}>
                      <div style={{ width: '30px', height: '30px', background: 'var(--primary)', borderRadius: '50%', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{j+1}</div>
                      <p style={{ fontSize: '0.85rem' }}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '100px 20px', textAlign: 'center' }}>
        <div className="premium-card" style={{ maxWidth: '900px', margin: '0 auto', padding: '60px', background: 'var(--accent-gradient)' }}>
          <h2 style={{ fontSize: '3rem', color: 'white', marginBottom: '16px' }}>Prêt à commencer ?</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', marginBottom: '40px' }}>Rejoignez des milliers d'utilisateurs satisfaits dès aujourd'hui.</p>
          <Link to="/register" className="glass" style={{ padding: '16px 40px', borderRadius: '12px', fontWeight: '700', background: 'white', color: 'black' }}>
            S'inscrire Maintenant
          </Link>
        </div>
      </section>
    </div>
  );
}

