import React from 'react';

export default function Terms() {
  return (
    <div className="container" style={{ maxWidth: '900px', margin: '60px auto', padding: '40px' }}>
      <div className="premium-card" style={{ padding: '40px' }}>
        <h1 style={{ color: 'var(--primary)', marginBottom: '40px' }}>Conditions Générales de Vente</h1>
        
        <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '32px', lineHeight: '1.8' }}>
          <section>
            <h2 style={{ color: 'white', marginBottom: '16px' }}>1. Objet</h2>
            <p>Les présentes conditions générales visent à définir les modalités de vente entre GOLDEN SHOP et ses clients, de la commande aux services, en passant par le paiement et la livraison.</p>
          </section>

          <section>
            <h2 style={{ color: 'white', marginBottom: '16px' }}>2. Commandes</h2>
            <p>Toute commande passée sur le site implique l'adhésion entière et sans réserve du client aux présentes CGV. Le client s'engage à fournir des informations de livraison exactes et complètes.</p>
          </section>

          <section>
            <h2 style={{ color: 'white', marginBottom: '16px' }}>3. Prix et Paiement</h2>
            <p>Les prix sont indiqués en Dollars ($) et sont fermes. Le paiement est exigible à la commande et s'effectue via les moyens de paiement sécurisés proposés sur la plateforme.</p>
          </section>

          <section>
            <h2 style={{ color: 'white', marginBottom: '16px' }}>4. Livraison</h2>
            <p>Les produits sont livrés à l'adresse indiquée par le client lors de la commande. Les délais de livraison sont donnés à titre indicatif et GOLDEN SHOP ne pourra être tenu responsable des retards liés aux transporteurs ou aux vendeurs.</p>
          </section>

          <section>
            <h2 style={{ color: 'white', marginBottom: '16px' }}>5. Responsabilité</h2>
            <p>GOLDEN SHOP agit en tant que plateforme de mise en relation. La responsabilité de la conformité des produits incombe aux vendeurs respectifs de chaque article.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
