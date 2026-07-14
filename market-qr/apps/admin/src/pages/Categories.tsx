import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, ChevronRight, ChevronDown, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { categoriesApi } from '../lib/api';

export default function Categories() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    parentId: '',
  });

  useEffect(() => {
    loadCategories();
  }, [token]);

  const loadCategories = async () => {
    if (!token) return;

    try {
      const response = await categoriesApi.list();
      const data = Array.isArray(response) ? response : response.data || [];
      setCategories(data);
      
      // Expand root categories by default
      const rootIds = data.filter((c: any) => !c.parentId).map((c: any) => c.id);
      setExpanded(rootIds);
    } catch (error) {
      console.error('Categories error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const openCreateModal = (parentId?: string) => {
    setEditingCategory(null);
    setFormData({ name: '', parentId: parentId || '' });
    setShowModal(true);
  };

  const openEditModal = (category: any) => {
    setEditingCategory(category);
    setFormData({ name: category.name, parentId: category.parentId || '' });
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!token) return;
    if (!confirm(`"${name}" kategorisini silmek istediğinize emin misiniz?`)) return;

    try {
      await categoriesApi.delete(id);
      await loadCategories();
    } catch (error: any) {
      alert(error.message || 'Silme başarısız');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const data: any = { name: formData.name };
      if (formData.parentId) {
        data.parentId = formData.parentId;
      }

      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, data);
      } else {
        await categoriesApi.create(data);
      }

      setShowModal(false);
      await loadCategories();
    } catch (error: any) {
      alert(error.message || 'İşlem başarısız');
    }
  };

  // Build tree structure
  const buildTree = (items: any[], parentId: string | null = null): any[] => {
    return items
      .filter((item) => (parentId ? item.parentId === parentId : !item.parentId))
      .map((item) => ({
        ...item,
        children: buildTree(items, item.id),
      }));
  };

  const tree = buildTree(categories);

  const renderCategory = (category: any, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expanded.includes(category.id);

    return (
      <div key={category.id}>
        <div
          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
          style={{ paddingLeft: `${level * 24 + 12}px` }}
        >
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(category.id)}
                className="text-gray-500"
              >
                {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </button>
            ) : (
              <span className="w-5" />
            )}
            <span className="font-medium">{category.name}</span>
            {hasChildren && (
              <span className="text-gray-400 text-sm">
                ({category.children.length} alt kategori)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openCreateModal(category.id)}
              className="text-primary-600 hover:text-primary-900 text-sm"
            >
              + Alt Kategori
            </button>
            <button
              onClick={() => openEditModal(category)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => handleDelete(category.id, category.name)}
              className="text-red-400 hover:text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="space-y-1">
            {category.children.map((child: any) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Kategoriler</h2>
        <button
          onClick={() => openCreateModal()}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
        >
          <Plus size={20} />
          Yeni Kategori
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-2">
          {tree.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Kategori bulunamadı</p>
          ) : (
            tree.map((category) => renderCategory(category))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Adı</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Üst Kategori (Opsiyonel)</label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Kök Kategori</option>
                  {categories
                    .filter((c) => !c.parentId)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingCategory ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
