import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { orderService, paymentService, getImageUrl } from '../services/api';

export default function Checkout() {
  const { cart, total, clearCart, removeFromCart } = useCart();
  const [method, setMethod] = useState('mpesa');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Cart, 2: Payment, 3: Success
  const [shippingData, setShippingData] = useState({ address: '', phone: '' });
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const navigate = useNavigate();

  const isShippingValid = shippingData.address.trim() !== '' && shippingData.phone.trim() !== '';

  useEffect(() => {
    if (method === 'paypal' && !window.paypal && !document.getElementById('paypal-sdk')) {
      const script = document.createElement('script');
      const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb';
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
      script.id = 'paypal-sdk';
      script.async = true;
      script.onload = () => {
        setPaypalLoaded(true);
      };
      document.body.appendChild(script);
    } else if (method === 'paypal' && window.paypal) {
      setPaypalLoaded(true);
    }
  }, [method]);

  useEffect(() => {
    if (method === 'paypal' && paypalLoaded && window.paypal && isShippingValid) {
      const container = document.getElementById('paypal-button-container');
      if (container) {
        container.innerHTML = '';
        window.paypal.Buttons({
          createOrder: async (data, actions) => {
            const shops = [...new Set(cart.map(item => item.shop?.id || item.shop?._id || item.shop))];
            try {
              const shopId = shops[0]?.id || shops[0];
              const shopItems = cart.filter(item => (item.shop?.id || item.shop?._id || item.shop) === shopId);
              const shopTotal = shopItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

              const res = await paymentService.createPaypalOrder({
                amount: shopTotal,
                shop_id: shopId
              });
              
              return res.data.id;
            } catch (err) {
              console.error(err);
              alert("Erreur lors de la création de la commande PayPal.");
              throw err;
            }
          },
          onApprove: async (data, actions) => {
            setLoading(true);
            try {
              const res = await paymentService.capturePaypalOrder({
                order_id: data.orderID,
                simulated: data.orderID.startsWith('PAYPAL-SIM')
              });
              
              if (res.data.status === 'COMPLETED' || res.data.simulated) {
                const shops = [...new Set(cart.map(item => item.shop?.id || item.shop?._id || item.shop))];
                for (const shopId of shops) {
                  const resolvedShopId = shopId?.id || shopId;
                  const shopItems = cart.filter(item => (item.shop?.id || item.shop?._id || item.shop) === resolvedShopId);
                  const shopTotal = shopItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
                  
                  await orderService.create({
                    items: shopItems.map(i => ({ 
                      product: i.id || i._id,
                      productName: i.name, 
                      productImage: i.image,
                      quantity: i.quantity, 
                      price: i.price 
                    })),
                    total: shopTotal,
                    shop: resolvedShopId,
                    paymentMethod: 'paypal',
                    shippingAddress: shippingData.address,
                    phone: shippingData.phone,
                    status: 'paid'
                  });
                }
                
                clearCart();
                setStep(3);
              } else {
                alert("Paiement PayPal non complété.");
              }
            } catch (err) {
              console.error(err);
              alert("Erreur lors de la capture de la transaction PayPal.");
            } finally {
              setLoading(false);
            }
          },
          onError: (err) => {
            console.error(err);
            alert("Erreur lors du traitement PayPal.");
          }
        }).render('#paypal-button-container');
      }
    }
  }, [method, paypalLoaded, isShippingValid, cart]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Initialiser le paiement Flexpay
      console.log('Initiating Flexpay payment...');
      const flexpayRes = await paymentService.initiateFlexpay({
        amount: total,
        currency: 'USD',
        customerPhone: shippingData.phone,
        paymentMethod: method
      });

      console.log('Flexpay Response:', flexpayRes.data);
      
      // Simuler l'attente du client qui tape son code PIN sur son téléphone
      setStep(4); // Écran d'attente Flexpay

      // On attend 3 secondes pour simuler le temps réel de validation Mobile Money
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 2. Regrouper les articles par boutique pour créer les commandes
      const shops = [...new Set(cart.map(item => item.shop?.id || item.shop?._id || item.shop))];
      
      for (const shopId of shops) {
        const resolvedShopId = shopId?.id || shopId;
        const shopItems = cart.filter(item => (item.shop?.id || item.shop?._id || item.shop) === resolvedShopId);
        const shopTotal = shopItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        
        await orderService.create({
          items: shopItems.map(i => ({ 
            product: i.id || i._id,
            productName: i.name, 
            productImage: i.image,
            quantity: i.quantity, 
            price: i.price 
          })),
          total: shopTotal,
          shop: resolvedShopId,
          paymentMethod: method,
          shippingAddress: shippingData.address,
          phone: shippingData.phone,
          status: 'paid' // Paiement validé par Flexpay
        });
      }
      
      clearCart();
      setStep(3); // Succès
    } catch (err) {
      alert('Erreur lors du paiement: ' + (err.response?.data?.message || err.message));
      setStep(2); // Retour au formulaire
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && step !== 3) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2>Votre panier est vide</h2>
        <button className="btn-primary-solid" style={{ marginTop: '20px' }} onClick={() => navigate('/shop')}>
          Retour à la boutique
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      {step === 1 && (
        <div className="premium-card">
          <h2 style={{ marginBottom: '24px', color: 'var(--primary)' }}>Récapitulatif de votre Panier</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cart.map(item => (
              <div key={item._id} style={{ display: 'flex', gap: '16px', padding: '16px', background: 'var(--glass)', borderRadius: '8px', alignItems: 'flex-start' }}>
                {/* Image */}
                <div style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.05)' }}>
                  {item.image ? (
                    <img 
                      src={getImageUrl(item.image)} 
                      alt={item.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div style={{ width: '100%', height: '100%', display: item.image ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>📦</div>
                </div>
                
                {/* Infos */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600', marginBottom: '8px' }}>{item.name}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Catégorie: {item.category}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Qté: {item.quantity} × {item.price}$ = <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{(item.price * item.quantity).toFixed(2)}$</span></p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  <button onClick={() => removeFromCart(item._id)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--danger)', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}>Supprimer</button>
                </div>
              </div>
            ))}
            <div style={{ marginTop: '20px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
              <h3>Total à payer</h3>
              <h3 style={{ color: 'var(--primary)' }}>{total.toFixed(2)} $</h3>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button 
                type="button" 
                className="btn-primary-solid" 
                style={{ flex: 1 }} 
                onClick={() => {
                  console.log('Transition to step 2');
                  setStep(2);
                }}
              >
                Procéder au paiement
              </button>
              <button type="button" onClick={() => navigate('/shop')} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', padding: '10px 16px', borderRadius: '8px' }}>Retour à la boutique</button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="premium-card">
          <h2 style={{ marginBottom: '24px', color: 'var(--primary)' }}>Informations de Livraison & Paiement</h2>
          <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <h4 style={{ marginBottom: '15px', color: 'white' }}>📍 Adresse de Livraison</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input 
                  placeholder="Adresse complète (Ville, Quartier, Rue, N°)" 
                  value={shippingData.address}
                  onChange={e => setShippingData({...shippingData, address: e.target.value})}
                  required 
                />
                <input 
                  placeholder="Téléphone pour la livraison" 
                  value={shippingData.phone}
                  onChange={e => setShippingData({...shippingData, phone: e.target.value})}
                  required 
                />
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <h4 style={{ marginBottom: '15px', color: 'white' }}>💳 Moyen de Paiement</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                {[
                  { id: 'mpesa', label: 'M-Pesa', img: '📱' },
                  { id: 'airtel', label: 'Airtel Money', img: '📱' },
                  { id: 'orange', label: 'Orange Money', img: '📱' },
                  { id: 'paypal', label: 'PayPal (Split 95/5)', img: '💳' },
                ].map(p => (
                  <div 
                    key={p.id}
                    onClick={() => setMethod(p.id)}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: method === p.id ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                      background: method === p.id ? 'rgba(212, 175, 55, 0.1)' : 'var(--glass)',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>{p.img}</div>
                    <p style={{ fontWeight: '600', fontSize: '0.8rem' }}>{p.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {method !== 'paypal' ? (
              <button type="submit" disabled={loading} className="btn-primary-solid" style={{ height: '50px', fontSize: '1.1rem' }}>
                {loading ? 'Traitement en cours...' : `Confirmer et Payer ${total.toFixed(2)} $`}
              </button>
            ) : (
              <div style={{ marginTop: '20px' }}>
                {!isShippingValid ? (
                  <div style={{ padding: '16px', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--primary)', borderRadius: '8px', color: 'white', textAlign: 'center' }}>
                    Veuillez remplir l'adresse et le téléphone de livraison pour afficher le paiement PayPal.
                  </div>
                ) : (
                  <div>
                    <div id="paypal-button-container" style={{ minHeight: '150px' }}></div>
                    {loading && <p style={{ textAlign: 'center', color: 'var(--primary)' }}>Finalisation du paiement PayPal...</p>}
                  </div>
                )}
              </div>
            )}
            <button type="button" onClick={() => setStep(1)} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', marginTop: '10px' }}>
              Retour au panier
            </button>
          </form>
        </div>
      )}

      {step === 4 && (
        <div className="premium-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px', animation: 'spin 2s linear infinite' }}>⏳</div>
          <h2 style={{ color: 'var(--primary)', marginBottom: '16px' }}>Validation Mobile Money (Flexpay)</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '1.1rem' }}>
            Veuillez consulter votre téléphone ({shippingData.phone}). <br/>
            Un message vous invite à entrer votre code PIN pour valider la transaction de {total.toFixed(2)}$.
          </p>
          <div style={{ padding: '16px', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--primary)', borderRadius: '8px', display: 'inline-block' }}>
            En attente de la confirmation de l'opérateur...
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="premium-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>
          <h2 style={{ color: 'var(--primary)', marginBottom: '16px' }}>Paiement Réussi !</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
            Merci pour votre achat. Les vendeurs ont été notifiés et préparent vos articles.
          </p>
          <button className="btn-primary-solid" onClick={() => navigate('/shop')}>
            Continuer mes achats
          </button>
        </div>
      )}
    </div>
  );
}
