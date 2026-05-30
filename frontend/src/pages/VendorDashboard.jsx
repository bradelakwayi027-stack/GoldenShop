import React, { useState, useEffect } from 'react';
import { shopService, productService, orderService, messageService, getImageUrl } from '../services/api';
import { authUtils } from '../utils/auth';
import './Dashboard.css';

export default function VendorDashboard() {
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedShop, setSelectedShop] = useState('');
  const [shopForm, setShopForm] = useState({ name: '', description: '', owner_name: '' });
  const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '', category: '' });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: shopsData } = await shopService.getAll();
      const currentUser = authUtils.getUser();
      const myShops = shopsData.filter(s => s.owner?.id === currentUser?.id) || [];
      setShops(myShops);
      if (myShops.length > 0 && !selectedShop) setSelectedShop(myShops[0].id);

      const { data: prodsData } = await productService.getMyProducts();
      setProducts(prodsData);

      const { data: ordersData } = await orderService.getVendor();
      setOrders(ordersData);

      const { data: msgsData } = await messageService.getVendorMessages();
      setMessages(msgsData);
    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShop = async (e) => {
    e.preventDefault();
    try {
      await shopService.create(shopForm);
      setShopForm({ name: '', description: '', owner_name: '' });
      loadData();
    } catch (err) {
      alert('Erreur: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    const shop = shops.find(s => s.id === Number(selectedShop) || s.id === selectedShop);
    if (!shop?.is_approved) {
      alert('Votre boutique doit être approuvée par l\'administration avant d\'ajouter des produits.');
      return;
    }
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('stock', formData.stock);
    data.append('category', formData.category);
    data.append('shop_id', selectedShop);
    if (imageFile) data.append('image', imageFile);
    try {
      if (editingId) {
        await productService.update(editingId, data);
        setEditingId(null);
      } else {
        await productService.create(data);
      }
      setFormData({ name: '', description: '', price: '', stock: '', category: '' });
      setImageFile(null);
      loadData();
    } catch (err) {
      alert('Erreur: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Supprimer cet article ?')) {
      try { await productService.delete(id); loadData(); }
      catch (err) { alert('Erreur: ' + err.message); }
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Supprimer cette commande ?')) return;
    try { await orderService.delete(id); loadData(); }
    catch (err) { alert('Erreur: ' + (err.response?.data?.message || err.message)); }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setSelectedShop(p.shop?.id || p.shop);
    setFormData({ name: p.name, description: p.description, price: p.price, stock: p.stock, category: p.category || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="container" style={{ padding: '50px', textAlign: 'center' }}><p>Chargement du dashboard...</p></div>;

  return (
    <div className="dashboard" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: 'var(--primary)', marginBottom: '32px' }}>Tableau de Bord Vendeur</h1>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
        <button onClick={() => setActiveTab('products')} style={{ padding: '12px 24px', background: activeTab === 'products' ? 'var(--primary)' : 'transparent', color: activeTab === 'products' ? 'black' : 'white', border: activeTab === 'products' ? 'none' : '1px solid var(--glass-border)', borderRadius: '8px', fontWeight: activeTab === 'products' ? 'bold' : 'normal', cursor: 'pointer', fontSize: '1rem' }}>
          📦 Mes Articles
        </button>
        <button onClick={() => setActiveTab('orders')} style={{ padding: '12px 24px', background: activeTab === 'orders' ? 'var(--primary)' : 'transparent', color: activeTab === 'orders' ? 'black' : 'white', border: activeTab === 'orders' ? 'none' : '1px solid var(--glass-border)', borderRadius: '8px', fontWeight: activeTab === 'orders' ? 'bold' : 'normal', cursor: 'pointer', fontSize: '1rem', position: 'relative' }}>
          📋 Commandes
          {orders.filter(o => !o.is_read_by_vendor).length > 0 && (
            <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '50%', fontWeight: 'bold', border: '2px solid #1a1a1a' }}>
              {orders.filter(o => !o.is_read_by_vendor).length}
            </span>
          )}
        </button>
        <button onClick={() => setActiveTab('messages')} style={{ padding: '12px 24px', background: activeTab === 'messages' ? 'var(--primary)' : 'transparent', color: activeTab === 'messages' ? 'black' : 'white', border: activeTab === 'messages' ? 'none' : '1px solid var(--glass-border)', borderRadius: '8px', fontWeight: activeTab === 'messages' ? 'bold' : 'normal', cursor: 'pointer', fontSize: '1rem', position: 'relative' }}>
          ✉️ Messages Admin
          {messages.filter(m => !m.is_read).length > 0 && (
            <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '50%' }}>
              {messages.filter(m => !m.is_read).length}
            </span>
          )}
        </button>
      </div>

      {/* Onglet: Boutique et Articles */}
      {activeTab === 'products' && (
        <>
          <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            {/* Gestion Boutique */}
            <section className="premium-card">
              <h2 style={{ marginBottom: '20px' }}>Ma Boutique</h2>
              {shops.length > 0 ? (
                <div>
                  {shops.map(shop => (
                    <div key={shop.id} style={{ padding: '16px', background: 'var(--glass)', borderRadius: '12px', border: '1px solid var(--glass-border)', marginBottom: '12px' }}>
                      <h3 style={{ color: 'var(--primary)' }}>{shop.name}</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{shop.description}</p>
                      <p style={{ marginTop: '10px' }}>
                        Status: {shop.is_approved ? <span style={{ color: '#10b981' }}>✅ Approuvée</span> : <span style={{ color: '#f59e0b' }}>⏳ En attente d'approbation</span>}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleCreateShop} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>Créez votre boutique pour commencer.</p>
                  <input placeholder="Nom de la boutique" value={shopForm.name} onChange={e => setShopForm({...shopForm, name: e.target.value})} required />
                  <input placeholder="Nom du propriétaire" value={shopForm.owner_name} onChange={e => setShopForm({...shopForm, owner_name: e.target.value})} required />
                  <textarea placeholder="Description de la boutique" value={shopForm.description} onChange={e => setShopForm({...shopForm, description: e.target.value})} required />
                  <button type="submit" className="btn-primary-solid">Créer ma Boutique</button>
                </form>
              )}
            </section>

            {/* Ajouter/Modifier Produit */}
            <section className="premium-card">
              <h2 style={{ marginBottom: '20px' }}>{editingId ? "Modifier l'Article" : 'Ajouter un Article'}</h2>
              {shops.some(s => s.is_approved) ? (
                <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <select value={selectedShop} onChange={(e) => setSelectedShop(e.target.value)} required>
                    {shops.filter(s => s.is_approved).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <input placeholder="Nom de l'article" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                    <option value="">Sélectionnez une catégorie</option>
                    <option value="Électronique">Électronique</option>
                    <option value="Mode">Mode</option>
                    <option value="Maison">Maison</option>
                    <option value="Beauté">Beauté</option>
                    <option value="Alimentation">Alimentation</option>
                  </select>
                  <textarea placeholder="Description de l'article" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="number" placeholder="Prix (USD)" step="0.01" style={{ flex: 2 }} value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                    <input type="number" placeholder="Stock" style={{ flex: 1 }} value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
                  </div>
                  <div style={{ border: '1px dashed var(--glass-border)', padding: '10px', borderRadius: '8px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>
                      {editingId ? "Changer l'image (optionnel)" : 'Image du produit'}
                    </label>
                    <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
                  </div>
                  <button type="submit" className="btn-primary-solid">{editingId ? 'Enregistrer les modifications' : 'Mettre en vente'}</button>
                  {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({ name: '', description: '', price: '', stock: '', category: '' }); }} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'white' }}>Annuler</button>}
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <p style={{ color: 'var(--danger)' }}>Boutique non approuvée.</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>Vous pourrez ajouter des articles dès que l'admin aura validé votre boutique.</p>
                </div>
              )}
            </section>
          </div>

          {/* Mes Articles */}
          <section className="premium-card" style={{ marginBottom: '40px' }}>
            <h2 style={{ marginBottom: '24px' }}>Mes Articles ({products.length})</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
              {products.map(p => (
                <div key={p.id} style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '120px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '12px', overflow: 'hidden' }}>
                    {p.image
                      ? <img src={getImageUrl(p.image)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display='none'; }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>📦</div>
                    }
                  </div>
                  <h4 style={{ color: 'white' }}>{p.name}</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '4px' }}>{p.category}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0', flexGrow: 1 }}>{p.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{p.price} $</p>
                    <p style={{ fontSize: '0.8rem' }}>Stock: {p.stock}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button onClick={() => startEdit(p)} style={{ flex: 1, padding: '6px', fontSize: '0.8rem', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white' }}>Modifier</button>
                    <button onClick={() => handleDeleteProduct(p.id)} style={{ flex: 1, padding: '6px', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}>Supprimer</button>
                  </div>
                </div>
              ))}
              {products.length === 0 && <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)' }}>Aucun article en vente.</p>}
            </div>
          </section>
        </>
      )}

      {/* Onglet: Commandes */}
      {activeTab === 'orders' && (
        <section className="premium-card">
          <h2 style={{ marginBottom: '24px' }}>Ventes Récentes ({orders.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map(o => (
              <div key={o.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', background: o.is_read_by_vendor ? 'var(--glass)' : 'rgba(212, 175, 55, 0.05)', borderRadius: '12px', border: o.is_read_by_vendor ? '1px solid var(--glass-border)' : '1px solid var(--primary)', position: 'relative' }}>
                {!o.is_read_by_vendor && (
                  <div style={{ position: 'absolute', top: '-10px', left: '20px', background: 'var(--primary)', color: 'black', padding: '2px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>NOUVEAU</div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>Commande #{String(o.id).padStart(6, '0').toUpperCase()}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Client: <span style={{ color: 'white' }}>{o.user?.name}</span></p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Tél: {o.phone}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>{o.total}$</p>
                    <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', background: o.status === 'paid' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: o.status === 'paid' ? '#10b981' : '#f59e0b' }}>
                      {o.status?.toUpperCase()}
                    </span>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
                      {!o.is_read_by_vendor && (
                        <button onClick={async () => { await orderService.markAsRead(o.id); loadData(); }} style={{ background: 'var(--primary)', color: 'black', padding: '6px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>✓ Lu</button>
                      )}
                      <button onClick={() => handleDeleteOrder(o.id)} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>Supprimer</button>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold' }}>Articles commandés:</p>
                  {o.items?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.05)' }}>
                        {item.product_image
                          ? <img src={getImageUrl(item.product_image)} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display='none'; }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📦</div>
                        }
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '600', marginBottom: '4px' }}>{item.product_name}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Qté: {item.quantity} × {item.price}$ = <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{(item.quantity * item.price).toFixed(2)}$</span></p>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '12px', background: 'rgba(212, 175, 55, 0.05)', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.1)' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '8px', fontWeight: 'bold' }}>📍 Adresse de Livraison :</p>
                  <p style={{ fontSize: '0.9rem' }}>{o.shipping_address}</p>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>Aucune vente pour le moment.</p>}
          </div>
        </section>
      )}

      {/* Onglet: Messages Admin */}
      {activeTab === 'messages' && (
        <section className="premium-card">
          <h2 style={{ marginBottom: '24px' }}>Messages de l'Administration ({messages.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ padding: '24px', background: msg.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(212, 175, 55, 0.05)', borderRadius: '12px', border: msg.is_read ? '1px solid var(--glass-border)' : '1px solid var(--primary)', position: 'relative' }}>
                {!msg.is_read && (
                  <button onClick={async () => { await messageService.markAsRead(msg.id); loadData(); }} style={{ position: 'absolute', top: '20px', right: '20px', padding: '4px 8px', fontSize: '0.75rem', background: 'var(--primary)', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Marquer comme lu
                  </button>
                )}
                <div style={{ marginBottom: '12px' }}>
                  <h3 style={{ color: 'white', marginBottom: '4px' }}>{msg.subject}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Envoyé par: <span style={{ color: 'var(--primary)' }}>{msg.sender?.name}</span> le {new Date(msg.created_at).toLocaleString()}
                  </p>
                </div>
                <div style={{ color: 'var(--text-main)', lineHeight: '1.6', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📩</div>
                <p>Aucun message de l'administration pour le moment.</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
