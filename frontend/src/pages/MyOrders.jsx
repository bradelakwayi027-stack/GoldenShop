import React, { useState, useEffect } from 'react';
import { orderService } from '../services/api';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await orderService.getMine();
        setOrders(data);
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleDeleteOrder = async (id) => {
    if (window.confirm('Voulez-vous supprimer ce message de commande ?')) {
      try {
        await orderService.delete(id);
        setOrders(orders.filter(o => o._id !== id));
      } catch (err) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  if (loading) return <div className="container" style={{ padding: '50px', textAlign: 'center' }}><p>Chargement de vos commandes...</p></div>;

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <h1 style={{ color: 'var(--primary)', marginBottom: '32px' }}>📦 Mes Commandes</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {orders.map(order => (
          <div key={order._id} className="premium-card" style={{ padding: '24px', position: 'relative' }}>
            <button 
              onClick={() => handleDeleteOrder(order._id)}
              style={{
                position: 'absolute',
                bottom: '24px',
                right: '24px',
                background: 'rgba(239, 68, 68, 0.05)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.1)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.15)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.05)'}
            >
              🗑️ Supprimer
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--glass-border)', pb: '12px' }}>
              <div>
                <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Commande #{order._id.slice(-6).toUpperCase()}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>{order.total} $</p>
                <span style={{ 
                  fontSize: '0.75rem', 
                  padding: '4px 10px', 
                  borderRadius: '20px', 
                  background: order.status === 'delivered' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(212, 175, 55, 0.1)',
                  color: order.status === 'delivered' ? '#10b981' : 'var(--primary)',
                  border: '1px solid currentColor'
                }}>
                  {order.status.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Articles :</p>
              {order.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', marginBottom: '4px' }}>
                  <span>{item.quantity}x {item.product}</span>
                  <span>{item.price} $</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', fontSize: '0.9rem' }}>
              <p>🏪 Boutique: <span style={{ color: 'var(--primary)' }}>{order.shop?.name}</span></p>
              <p>📍 Livraison: {order.shippingAddress}</p>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="premium-card" style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Vous n'avez pas encore passé de commande.</p>
          </div>
        )}
      </div>
    </div>
  );
}
