import { useState, useEffect } from 'react';
import { Edit2, Save, X, Plus, Trash2, Package, Coffee, Cookie } from 'lucide-react';
import { loadDataFromAPI } from '../services/api';
import { ENDPOINTS } from '../utils/endpoints';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [typeMachine, setTypeMachine] = useState('coffee');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    type: '', 
    type_machine: 'coffee', 
    supplier: '',
    cost: '',
    price: '', 
  });
  const [loading, setLoading] = useState(false);
  const [productTypes, setProductTypes] = useState([]);
  const [typeMachines, setTypeMachines] = useState([]);

  useEffect(() => {
    loadDataFromAPI(ENDPOINTS.products, setProducts);
    // Cargar opciones desde el backend
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/products/options/');
      if (response.ok) {
        const data = await response.json();
        setProductTypes(data.types);
        setTypeMachines(data.machines);
      }
    } catch (error) {
      console.error('Error cargando opciones:', error);
    }
  };


  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!newProduct.name.trim()) {
      alert('Por favor ingresa un nombre para el producto');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: newProduct.name,
        type_machine: typeMachine,
        supplier: newProduct.supplier || '',
        cost: parseFloat(newProduct.cost) || 0,
        price: parseFloat(newProduct.price) || 0,
      };
      
      // El tipo se asigna según type_machine (lógica en backend)
      if (typeMachine === 'snack' && newProduct.type) {
        payload.type = newProduct.type;
      } else if (typeMachine === 'coffee') {
        payload.type = 'cafe';
      }
      
      const response = await fetch(`http://localhost:8000/api/${ENDPOINTS.products}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setNewProduct({ name: '', type: '', type_machine: typeMachine, supplier: '', cost: '', price: '' });
        setShowAddForm(false);
        await loadDataFromAPI(ENDPOINTS.products, setProducts);
        alert('Producto agregado correctamente');
      } else {
        const errorData = await response.json();
        alert('Error: ' + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/${ENDPOINTS.products}/${id}/`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await loadDataFromAPI(ENDPOINTS.products, setProducts);
          alert('Producto eliminado correctamente');
        } else {
          const errorData = await response.json();
          alert('Error: ' + JSON.stringify(errorData));
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
      } finally {
        setLoading(false);
      }
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditForm({ ...product });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    setLoading(true);
    
    if (!editForm.name.trim()) {
      alert('El nombre del producto es requerido');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: editForm.name,
        type: editForm.type || 'cafe',
        type_machine: editForm.type_machine || typeMachine,
        supplier: editForm.supplier || '',
        cost: parseFloat(editForm.cost) || 0,
        price: parseFloat(editForm.price) || 0,
      };

      const response = await fetch(`http://localhost:8000/api/${ENDPOINTS.products}/${editingId}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setEditingId(null);
        setEditForm({});
        await loadDataFromAPI(ENDPOINTS.products, setProducts);
        alert('Producto actualizado correctamente');
      } else {
        const errorData = await response.json();
        alert('Error: ' + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => p.type_machine === typeMachine);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', color: 'var(--color-primary)' }}>Productos</h1>
          <p className="text-muted">Gestión por tipo de máquina</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={loading}
        >
          {showAddForm ? <X size={18} /> : <Plus size={18} />}
          {showAddForm ? 'Cancelar' : `Nuevo Producto (${typeMachine === 'coffee' ? 'Café' : 'Snack'})`}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)' }}>
        <button
          onClick={() => setTypeMachine('coffee')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '1rem',
            background: 'transparent',
            border: 'none',
            borderBottom: typeMachine === 'coffee' ? '2px solid var(--color-accent)' : '2px solid transparent',
            color: typeMachine === 'coffee' ? 'var(--color-accent)' : 'var(--color-text-muted)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Coffee size={20} /> Máquinas de Café
        </button>
        <button
          onClick={() => setTypeMachine('snack')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '1rem',
            background: 'transparent',
            border: 'none',
            borderBottom: typeMachine === 'snack' ? '2px solid var(--color-accent)' : '2px solid transparent',
            color: typeMachine === 'snack' ? 'var(--color-accent)' : 'var(--color-text-muted)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Cookie size={20} /> Máquinas de Snacks
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--color-accent)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Agregar a: {typeMachine === 'coffee' ? 'Café' : 'Snacks'}</h3>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: typeMachine === 'snack' ? 'minmax(200px, 1.5fr) 1fr 1fr 1fr 1fr auto' : 'minmax(200px, 1.5fr) 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Nombre</label>
              <input 
                className="input" 
                placeholder="Nombre del producto"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                required
              />
            </div>
            
            {typeMachine === 'snack' && (
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Tipo</label>
                <select
                  className="input"
                  value={newProduct.type}
                  onChange={(e) => setNewProduct({...newProduct, type: e.target.value})}
                >
                  <option value="">Seleccionar...</option>
                  {productTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Proveedor</label>
              <input 
                className="input" 
                placeholder="Ej. Nestlé"
                value={newProduct.supplier}
                onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Costo ($)</label>
              <input 
                type="number" step="0.1" 
                className="input" 
                placeholder="0.00"
                value={newProduct.cost}
                onChange={(e) => setNewProduct({...newProduct, cost: e.target.value})}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Venta ($)</label>
              <input 
                type="number" step="0.1" 
                className="input" 
                placeholder="0.00"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: '42px' }} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
            <tr>
              <th style={{ padding: '1rem' }}>Producto</th>
              {typeMachine === 'snack' && <th style={{ padding: '1rem' }}>Tipo</th>}
              <th style={{ padding: '1rem' }}>Proveedor</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Costo</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Venta</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Margen</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr><td colSpan={typeMachine === 'snack' ? 7 : 6} style={{ padding: '2rem', textAlign: 'center' }}>No hay productos en esta categoría</td></tr>
            ) : filteredProducts.map(product => {
              const isEditing = editingId === product.id;

              return (
                <tr key={product.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {/* Name */}
                  <td style={{ padding: '1rem', fontWeight: 500 }}>
                    {isEditing ? (
                      <div>
                        <input 
                          className="input" 
                          style={{ marginBottom: '0.25rem' }}
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        />
                         {/* Optional Category Switcher during Edit uses internal logic, maybe hide here or keep? 
                             Keeping category switch allows moving from coffee to snack. 
                             If moving to snack, type might correspond. If moving to coffee, type is ignored. */}
                        <select 
                          style={{ fontSize: '0.75rem', padding: '0.25rem' }}
                          value={editForm.type_machine || ''}
                          onChange={(e) => setEditForm({...editForm, type_machine: e.target.value})}
                        >
                          <option value="coffee">Café (Máq)</option>
                          <option value="snack">Snack (Máq)</option>
                        </select>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Package size={16} className="text-muted" />
                        {product.name}
                      </div>
                    )}
                  </td>
                  
                  {/* Type - Only for Snacks */}
                  {typeMachine === 'snack' && (
                    <td style={{ padding: '1rem' }}>
                      {isEditing ? (
                        <select 
                          className="input" 
                          value={editForm.type || ''}
                          onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                        >
                           <option value="">-</option>
                           {productTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      ) : (
                        <span className="text-muted">
                          {productTypes.find(t => t.value === product.type)?.label || product.type || '-'}
                        </span>
                      )}
                    </td>
                  )}

                  {/* Provider */}
                  <td style={{ padding: '1rem' }}>
                    {isEditing ? (
                      <input 
                        className="input" 
                        value={editForm.supplier || ''}
                        onChange={(e) => setEditForm({...editForm, supplier: e.target.value})}
                      />
                    ) : (
                      <span className="text-muted">{product.supplier || '-'}</span>
                    )}
                  </td>
                  
                  {/* Cost */}
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {isEditing ? (
                      <input 
                        type="number" step="0.1" 
                        className="input" 
                        style={{ width: '80px', padding: '0.25rem', textAlign: 'right' }}
                        value={editForm.cost || ''}
                        onChange={(e) => setEditForm({...editForm, cost: e.target.value})}
                      />
                    ) : (
                      `$${product.cost}`
                    )}
                  </td>
                  
                  {/* Price */}
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {isEditing ? (
                      <input 
                        type="number" step="0.1" 
                        className="input" 
                        style={{ width: '80px', padding: '0.25rem', textAlign: 'right' }}
                        value={editForm.price || ''}
                        onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                      />
                    ) : (
                      <span style={{ fontWeight: 600 }}>${product.price}</span>
                    )}
                  </td>
                  
                  {/* Margin */}
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ color: product.margin > 0 ? 'var(--color-success)' : 'var(--color-text-muted)', fontWeight: 600 }}>
                      ${product.margin?.toFixed(2) || '0.00'}
                    </div>
                    {product.price > 0 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {product.margin_percentage?.toFixed(2) || '0.00'}%
                      </div>
                    )}
                  </td>
                  
                  {/* Actions */}
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                        <button className="btn btn-primary" style={{ padding: '0.25rem' }} onClick={saveEdit} disabled={loading}>
                          <Save size={16} />
                        </button>
                        <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={cancelEdit} disabled={loading}>
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                        <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={() => startEdit(product)} disabled={loading}>
                          <Edit2 size={16} />
                        </button>
                        <button className="btn btn-ghost" style={{ padding: '0.25rem', color: 'var(--color-error)' }} onClick={() => handleDelete(product.id)} disabled={loading}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
