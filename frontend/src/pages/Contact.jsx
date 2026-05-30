import React from 'react';

export default function Contact() {
  return (
    <div className="container" style={{ maxWidth: '800px', margin: '60px auto', padding: '40px' }}>
      <div className="premium-card">
        <h1 style={{ color: 'var(--primary)', marginBottom: '32px' }}>Contactez-nous</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '40px', lineHeight: '1.6' }}>
          Vous avez une question ou besoin d'assistance ? Notre équipe est à votre disposition pour vous répondre dans les plus brefs délais.
        </p>

        <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'white' }}>Nom complet</label>
            <input type="text" placeholder="Votre nom" style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'white' }}>Email</label>
            <input type="email" placeholder="votre@email.com" style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'white' }}>Message</label>
            <textarea placeholder="Comment pouvons-nous vous aider ?" style={{ width: '100%', minHeight: '150px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '16px', color: 'white' }}></textarea>
          </div>
          <button type="submit" className="btn-primary-solid" style={{ height: '50px', marginTop: '10px' }}>
            Envoyer le message
          </button>
        </form>

        <div style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid var(--glass-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div>
            <h4 style={{ color: 'var(--primary)', marginBottom: '12px' }}>📍 Notre Siège</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Boulevard du 30 Juin, Kinshasa, RDC</p>
          </div>
          <div>
            <h4 style={{ color: 'var(--primary)', marginBottom: '12px' }}>📞 Support</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>+243 812 345 678<br />contact@goldenshop.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
