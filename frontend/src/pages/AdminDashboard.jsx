import React, { useState, useEffect } from 'react';
import { shopService, userService, orderService, messageService } from '../services/api';
import './Dashboard.css';

export default function AdminDashboard() {
  const [shops, setShops] = useState([]);
  const [pendingShops, setPendingShops] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [totalCommission, setTotalCommission] = useState(0);
  const [activeTab, setActiveTab] = useState('stats');

  // Message states
  const [msgForm, setMsgForm] = useState({ recipient: '', subject: '', content: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: allShops } = await shopService.getAll();
      setShops(allShops);
      const { data: pending } = await shopService.getPending();
      setPendingShops(pending);
      const { data: allUsers } = await userService.getAll();
      setUsers(allUsers);
      const { data: ordersData } = await orderService.getAdmin();
      setOrders(ordersData.orders || []);
      setTotalCommission(ordersData.totalCommission || 0);
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgForm.recipient || !msgForm.subject || !msgForm.content) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    setSending(true);
    try {
      await messageService.adminSend({
        recipient_id: msgForm.recipient,
        subject: msgForm.subject,
        content: msgForm.content
      });
      alert('Message envoyé avec succès !');
      setMsgForm({ recipient: '', subject: '', content: '' });
    } catch (err) {
      let errorMsg = err.message;
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          errorMsg = Object.entries(err.response.data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('\n');
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        }
      }
      alert('Erreur:\n' + errorMsg);
    } finally {
      setSending(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await shopService.approve(id);
      loadData();
    } catch (err) { alert('Erreur: ' + err.message); }
  };

  const handleDeleteShop = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette boutique ?')) {
      try {
        await shopService.delete(id);
        loadData();
      } catch (err) { alert('Erreur: ' + err.message); }
    }
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette commande ?')) {
      try {
        await orderService.delete(id);
        loadData();
      } catch (err) {
        alert('Erreur: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="dashboard admin-dashboard" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: 'var(--primary)', marginBottom: '32px' }}>Administration Centrale</h1>

      <div className="tabs" style={{ display: 'flex', gap: '12px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '10px' }}>
        {[
          { id: 'stats', label: 'Vue d\'ensemble', icon: '📊' },
          { id: 'pending', label: `Demandes`, icon: '⏳', count: pendingShops.length },
          { id: 'shops', label: `Boutiques`, icon: '🏪' },
          { id: 'users', label: `Utilisateurs`, icon: '👥' },
          { id: 'orders', label: `Commandes`, icon: '🛒' },
          { id: 'messages', label: 'Communication', icon: '✉️' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: activeTab === tab.id ? 'var(--primary)' : 'var(--glass)',
              color: activeTab === tab.id ? 'black' : 'white',
              border: activeTab === tab.id ? 'none' : '1px solid var(--glass-border)',
              borderRadius: '12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
          >
            <span>{tab.icon} {tab.label}</span>
            {tab.count > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: '#ef4444',
                color: 'white',
                fontSize: '0.75rem',
                padding: '2px 8px',
                borderRadius: '50px',
                fontWeight: 'bold',
                border: '2px solid #1a1a1a',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'stats' && (
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {[
            { label: 'Boutiques', value: shops.length, color: 'white' },
            { label: 'Utilisateurs', value: users.length, color: 'white' },
            { label: 'Commandes', value: orders.length, color: 'white' },
            { label: 'Revenu Plateforme', value: `${totalCommission.toFixed(2)} $`, color: 'var(--primary)', highlight: true },
          ].map((stat, i) => (
            <div key={i} className="premium-card" style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>{stat.label}</p>
              <h2 style={{ color: stat.color, fontSize: stat.highlight ? '2rem' : '1.5rem' }}>{stat.value}</h2>
            </div>
          ))}
        </div>
      )}

      {(activeTab === 'pending' || activeTab === 'shops') && (
        <div className="premium-card">
          <h2 style={{ marginBottom: '20px' }}>{activeTab === 'pending' ? 'Demandes en attente' : 'Toutes les boutiques'}</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '16px' }}>Boutique</th>
                  <th style={{ padding: '16px' }}>Propriétaire</th>
                  <th style={{ padding: '16px' }}>Statut</th>
                  <th style={{ padding: '16px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'pending' ? pendingShops : shops).map(shop => (
                  <tr key={shop.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '16px' }}>
                      <p style={{ fontWeight: '600' }}>{shop.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{shop.description}</p>
                    </td>
                    <td style={{ padding: '16px' }}>{shop.owner_name || shop.owner?.name}</td>
                    <td style={{ padding: '16px' }}>
                      {shop.is_approved ? <span style={{ color: '#10b981' }}>Approuvée</span> : <span style={{ color: '#f59e0b' }}>En attente</span>}
                    </td>
                    <td style={{ padding: '16px', display: 'flex', gap: '8px' }}>
                      {!shop.is_approved && (
                        <button onClick={() => handleApprove(shop.id)} className="btn-primary-solid" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Approuver</button>
                      )}
                      <button onClick={() => handleDeleteShop(shop.id)} style={{ padding: '6px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.8rem' }}>
                        {activeTab === 'pending' ? 'Refuser' : 'Supprimer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(activeTab === 'pending' ? pendingShops : shops).length === 0 && <p style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Aucune donnée.</p>}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="premium-card">
          <h2 style={{ marginBottom: '20px' }}>Utilisateurs inscrits</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '16px' }}>Nom</th>
                  <th style={{ padding: '16px' }}>Email</th>
                  <th style={{ padding: '16px' }}>Rôle</th>
                  <th style={{ padding: '16px' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '16px', fontWeight: '600' }}>{user.name}</td>
                    <td style={{ padding: '16px' }}>{user.email}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', background: user.role === 'admin' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.1)', color: user.role === 'admin' ? 'var(--primary)' : 'white' }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '0.85rem' }}>{new Date(user.date_joined || user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'orders' && (
        <div className="premium-card">
          <h2 style={{ marginBottom: '24px' }}>Toutes les Commandes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map(o => (
              <div key={o.id} style={{ padding: '20px', background: 'var(--glass)', borderRadius: '12px', border: '1px solid var(--glass-border)', position: 'relative' }}>
                <button
                  onClick={() => handleDeleteOrder(o.id)}
                  style={{ position: 'absolute', bottom: '20px', right: '20px', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '6px', padding: '6px 12px', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.15)'}
                  onMouseOut={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.05)'}
                >
                  🗑️ Supprimer
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <p style={{ fontWeight: 'bold' }}>Commande #{String(o.id).padStart(6, '0').toUpperCase()}</p>
                  <p style={{ color: 'var(--primary)' }}>{o.total} $</p>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  <p>Client: {o.user?.name} ({o.user?.email})</p>
                  <p>Boutique: {o.shop?.name}</p>
                </div>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                  <p style={{ color: 'white', marginBottom: '4px', fontSize: '0.85rem' }}>📍 Infos Livraison :</p>
                  <p style={{ fontSize: '0.9rem' }}><strong>Adresse:</strong> {o.shipping_address}</p>
                  <p style={{ fontSize: '0.9rem' }}><strong>Tél:</strong> {o.phone}</p>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Aucune commande.</p>}
          </div>
        </div>
      )}
      {activeTab === 'messages' && (
        <div className="premium-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '24px' }}>Envoyer un message à un vendeur</h2>
          <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Destinataire (Vendeur)</label>
              <select
                value={msgForm.recipient}
                onChange={(e) => setMsgForm({ ...msgForm, recipient: e.target.value })}
                style={{ width: '100%' }}
                required
              >
                <option value="">Sélectionnez un vendeur</option>
                {users.filter(u => u.role === 'vendeur').map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Sujet</label>
              <input
                type="text"
                value={msgForm.subject}
                onChange={(e) => setMsgForm({ ...msgForm, subject: e.target.value })}
                placeholder="Ex: Mise à jour boutique, Problème produit..."
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Contenu du message</label>
              <textarea
                value={msgForm.content}
                onChange={(e) => setMsgForm({ ...msgForm, content: e.target.value })}
                placeholder="Votre message ici..."
                style={{ width: '100%', minHeight: '150px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '16px', color: 'white' }}
                required
              />
            </div>
            <button type="submit" className="btn-primary-solid" disabled={sending} style={{ height: '50px' }}>
              {sending ? 'Envoi en cours...' : '🚀 Envoyer le message'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

