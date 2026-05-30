import React, { useState, useEffect } from 'react';
import { shopService, productService, getImageUrl } from '../services/api';
import { authUtils } from '../utils/auth';
import { useCart } from '../context/CartContext';
import './Shop.css';

export default function Shop() {
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterShop, setFilterShop] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: shopsData } = await shopService.getAll();
        setShops(shopsData.filter(s => s.isApproved));
        
        const { data: allProducts } = await productService.getAll();
        setProducts(allProducts);
        setFilteredProducts(allProducts);
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = products;
    
    // Filtre par boutique
    if (filterShop !== 'all') {
      filtered = filtered.filter(p => p.shop?._id === filterShop);
    }
    
    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }
    
    setFilteredProducts(filtered);
  }, [filterShop, products, searchQuery]);

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '100px' }}><p>Chargement du catalogue...</p></div>;

  return (
    <div className="shop-page" style={{ padding: '40px 20px' }}>
      <div className="hero" style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '3.5rem', color: 'var(--primary)', marginBottom: '16px' }}>Catalogue <span style={{ color: 'white' }}>Privilège</span></h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Les meilleures boutiques de la RDC réunies en un seul endroit.</p>
        
        {/* Barre de Recherche */}
        <div style={{ marginTop: '40px', maxWidth: '600px', margin: '40px auto 0' }}>
          <div style={{ display: 'flex', gap: '8px', background: 'var(--glass)', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <span style={{ fontSize: '1.2rem' }}>🔍</span>
            <input 
              type="text"
              placeholder="Rechercher par nom, catégorie ou description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.95rem' }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <section className="products-section">
          <h2 style={{ marginBottom: '32px' }}>Tous les Articles</h2>
          <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px' }}>
            {products.map(product => (
              <div key={product._id} className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ height: '200px', background: 'var(--glass)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                  {product.image ? (
                    <img 
                      src={getImageUrl(product.image)} 
                      alt={product.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    style={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%', 
                      height: '100%',
                      display: product.image ? 'none' : 'flex',
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(212,175,55,0.05) 100%)',
                      backdropFilter: 'blur(10px)',
                      fontSize: '3rem'
                    }}
                  >
                    📦
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ color: 'white' }}>{product.name}</h3>
                  <span style={{ fontSize: '0.7rem', background: 'var(--primary)', color: 'black', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{product.category}</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flexGrow: 1 }}>{product.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.25rem' }}>{product.price} $</span>
                  <button onClick={() => addToCart(product)} className="btn-primary-solid" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                    Ajouter au panier
                  </button>
                </div>
                {!authUtils.isClient() && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--glass-border)', paddingTop: '8px' }}>
                    Vendu par: <span style={{ color: 'var(--primary)' }}>{product.shop?.name || 'Boutique'}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
          {filteredProducts.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>Aucun article trouvé.</p>}
        </section>
      </div>
    </div>
  );
}

