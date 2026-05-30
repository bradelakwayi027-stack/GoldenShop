import React from 'react';

export default function FAQ() {
  const faqs = [
    { q: "Comment passer une commande ?", a: "Ajoutez simplement vos articles au panier et suivez les étapes du paiement. Vous devrez fournir votre adresse et votre numéro de téléphone pour la livraison." },
    { q: "Quels sont les délais de livraison ?", a: "Les délais dépendent du vendeur et de votre localisation. En général, comptez entre 24h et 48h pour une livraison à Kinshasa." },
    { q: "Comment devenir vendeur ?", a: "Inscrivez-vous sur la plateforme en choisissant le rôle 'Vendeur'. Une fois votre boutique créée, l'administrateur devra l'approuver avant que vous ne puissiez mettre vos produits en ligne." },
    { q: "Quels sont les modes de paiement ?", a: "Nous acceptons les paiements via Mobile Money (M-Pesa, Airtel Money, Orange Money) ainsi que les cartes Visa/Mastercard." },
    { q: "Puis-je annuler une commande ?", a: "Oui, vous pouvez supprimer ou annuler vos commandes depuis votre espace 'Mes Commandes' tant qu'elles n'ont pas encore été expédiées par le vendeur." }
  ];

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '60px auto', padding: '40px' }}>
      <h1 style={{ color: 'var(--primary)', marginBottom: '40px', textAlign: 'center' }}>Foire Aux Questions (FAQ)</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {faqs.map((f, i) => (
          <div key={i} className="premium-card" style={{ padding: '24px' }}>
            <h3 style={{ color: 'white', marginBottom: '12px', fontSize: '1.2rem' }}>🤔 {f.q}</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
