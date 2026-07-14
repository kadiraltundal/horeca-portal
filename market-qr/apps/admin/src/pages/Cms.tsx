import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type TabType = 'banners' | 'pages' | 'blog' | 'faq' | 'announcements';

export default function Cms() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('banners');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Banner state
  const [banners, setBanners] = useState<any[]>([]);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    imageUrl: '',
    link: '',
    sortOrder: '0',
    startDate: '',
    endDate: '',
    isActive: true,
  });

  // Pages state
  const [pages, setPages] = useState<any[]>([]);
  const [pageForm, setPageForm] = useState({
    title: '',
    slug: '',
    content: '',
    metaDescription: '',
    isPublished: true,
  });

  // Blog state
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [blogForm, setBlogForm] = useState({
    title: '',
    content: '',
    author: '',
    excerpt: '',
    isPublished: true,
  });

  // FAQ state
  const [faqs, setFaqs] = useState<any[]>([]);
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: '',
    sortOrder: '0',
  });

  // Announcements state
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'NORMAL',
    isActive: true,
    expiresAt: '',
  });

  useEffect(() => {
    loadData();
  }, [token, activeTab]);

  const loadData = async () => {
    if (!token) return;

    setLoading(true);
    try {
      // Mock data - in real app, fetch from API
      switch (activeTab) {
        case 'banners':
          setBanners([
            { id: '1', title: 'Yaz İndirimi', imageUrl: '/banner1.jpg', link: '/promotions', sortOrder: 1, isActive: true },
            { id: '2', title: 'Yeni Ürünler', imageUrl: '/banner2.jpg', link: '/products', sortOrder: 2, isActive: true },
          ]);
          break;
        case 'pages':
          setPages([
            { id: '1', title: 'Hakkımızda', slug: 'hakkimizda', isPublished: true },
            { id: '2', title: 'İade Politikası', slug: 'iade-politikasi', isPublished: true },
          ]);
          break;
        case 'blog':
          setBlogPosts([
            { id: '1', title: 'Sağlıklı Beslenme İpuçları', author: 'Admin', isPublished: true, createdAt: '2024-01-15' },
            { id: '2', title: 'Yeni Ürünlerimiz Hakkında', author: 'Editor', isPublished: true, createdAt: '2024-01-20' },
          ]);
          break;
        case 'faq':
          setFaqs([
            { id: '1', question: 'Sipariş nasıl iptal edilir?', answer: 'Siparişinizi hesabınızdan iptal edebilirsiniz.', category: 'Sipariş', sortOrder: 1 },
            { id: '2', question: 'İade süreci nasıl işliyor?', answer: '14 gün içinde iade yapabilirsiniz.', category: 'İade', sortOrder: 2 },
          ]);
          break;
        case 'announcements':
          setAnnouncements([
            { id: '1', title: 'Sistem Bakımı', content: '25 Ocak akşamı sistem bakımı yapılacaktır.', priority: 'YÜKSEK', isActive: true },
          ]);
          break;
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    resetForms();
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    switch (activeTab) {
      case 'banners':
        setBannerForm({
          title: item.title || '',
          imageUrl: item.imageUrl || '',
          link: item.link || '',
          sortOrder: String(item.sortOrder || 0),
          startDate: item.startDate || '',
          endDate: item.endDate || '',
          isActive: item.isActive ?? true,
        });
        break;
      case 'pages':
        setPageForm({
          title: item.title || '',
          slug: item.slug || '',
          content: item.content || '',
          metaDescription: item.metaDescription || '',
          isPublished: item.isPublished ?? true,
        });
        break;
      case 'blog':
        setBlogForm({
          title: item.title || '',
          content: item.content || '',
          author: item.author || '',
          excerpt: item.excerpt || '',
          isPublished: item.isPublished ?? true,
        });
        break;
      case 'faq':
        setFaqForm({
          question: item.question || '',
          answer: item.answer || '',
          category: item.category || '',
          sortOrder: String(item.sortOrder || 0),
        });
        break;
      case 'announcements':
        setAnnouncementForm({
          title: item.title || '',
          content: item.content || '',
          priority: item.priority || 'NORMAL',
          isActive: item.isActive ?? true,
          expiresAt: item.expiresAt || '',
        });
        break;
    }
    setShowModal(true);
  };

  const resetForms = () => {
    setBannerForm({ title: '', imageUrl: '', link: '', sortOrder: '0', startDate: '', endDate: '', isActive: true });
    setPageForm({ title: '', slug: '', content: '', metaDescription: '', isPublished: true });
    setBlogForm({ title: '', content: '', author: '', excerpt: '', isPublished: true });
    setFaqForm({ question: '', answer: '', category: '', sortOrder: '0' });
    setAnnouncementForm({ title: '', content: '', priority: 'NORMAL', isActive: true, expiresAt: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      // Mock save - in real app, call API
      alert(editingItem ? 'Güncellendi' : 'Oluşturuldu');
      setShowModal(false);
      loadData();
    } catch (error: any) {
      alert(error.message || 'İşlem başarısız');
    }
  };

  const handleDelete = async (_id: string) => {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
    if (!token) return;

    try {
      // Mock delete - in real app, call API
      alert('Silindi');
      loadData();
    } catch (error: any) {
      alert(error.message || 'Silme başarısız');
    }
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'banners', label: 'Bannerlar' },
    { id: 'pages', label: 'Sayfalar' },
    { id: 'blog', label: 'Blog' },
    { id: 'faq', label: 'FAQ' },
    { id: 'announcements', label: 'Duyurular' },
  ];

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
        <h2 className="text-2xl font-bold">İçerik Yönetimi</h2>
        <button
          onClick={openCreateModal}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
        >
          <Plus size={20} />
          Yeni {tabs.find(t => t.id === activeTab)?.label.slice(0, -1)}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {activeTab === 'banners' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sıra</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                </>
              )}
              {activeTab === 'pages' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                </>
              )}
              {activeTab === 'blog' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yazar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                </>
              )}
              {activeTab === 'faq' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Soru</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sıra</th>
                </>
              )}
              {activeTab === 'announcements' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Öncelik</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                </>
              )}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {activeTab === 'banners' && banners.map((banner) => (
              <tr key={banner.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{banner.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{banner.sortOrder}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${banner.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {banner.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEditModal(banner)} className="text-gray-600 hover:text-gray-900"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(banner.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {activeTab === 'pages' && pages.map((page) => (
              <tr key={page.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{page.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{page.slug}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${page.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {page.isPublished ? 'Yayında' : 'Taslak'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEditModal(page)} className="text-gray-600 hover:text-gray-900"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(page.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {activeTab === 'blog' && blogPosts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{post.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.author}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.createdAt}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEditModal(post)} className="text-gray-600 hover:text-gray-900"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {activeTab === 'faq' && faqs.map((faq) => (
              <tr key={faq.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{faq.question}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{faq.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{faq.sortOrder}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEditModal(faq)} className="text-gray-600 hover:text-gray-900"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(faq.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {activeTab === 'announcements' && announcements.map((ann) => (
              <tr key={ann.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ann.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    ann.priority === 'YÜKSEK' ? 'bg-red-100 text-red-800' : ann.priority === 'ORTA' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {ann.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ann.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {ann.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEditModal(ann)} className="text-gray-600 hover:text-gray-900"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(ann.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingItem ? 'Düzenle' : 'Yeni Oluştur'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'banners' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                    <input type="text" value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Görsel URL</label>
                    <input type="text" value={bannerForm.imageUrl} onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                    <input type="text" value={bannerForm.link} onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sıra</label>
                      <input type="number" value={bannerForm.sortOrder} onChange={(e) => setBannerForm({ ...bannerForm, sortOrder: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                      <select value={bannerForm.isActive.toString()} onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.value === 'true' })} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                        <option value="true">Aktif</option>
                        <option value="false">Pasif</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'pages' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                    <input type="text" value={pageForm.title} onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input type="text" value={pageForm.slug} onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">İçerik</label>
                    <textarea value={pageForm.content} onChange={(e) => setPageForm({ ...pageForm, content: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={4} />
                  </div>
                </>
              )}

              {activeTab === 'blog' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                    <input type="text" value={blogForm.title} onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Yazar</label>
                    <input type="text" value={blogForm.author} onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">İçerik</label>
                    <textarea value={blogForm.content} onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={4} />
                  </div>
                </>
              )}

              {activeTab === 'faq' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Soru</label>
                    <input type="text" value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cevap</label>
                    <textarea value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                      <input type="text" value={faqForm.category} onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sıra</label>
                      <input type="number" value={faqForm.sortOrder} onChange={(e) => setFaqForm({ ...faqForm, sortOrder: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'announcements' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                    <input type="text" value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">İçerik</label>
                    <textarea value={announcementForm.content} onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Öncelik</label>
                      <select value={announcementForm.priority} onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                        <option value="DÜŞÜK">Düşük</option>
                        <option value="NORMAL">Normal</option>
                        <option value="ORTA">Orta</option>
                        <option value="YÜKSEK">Yüksek</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                      <select value={announcementForm.isActive.toString()} onChange={(e) => setAnnouncementForm({ ...announcementForm, isActive: e.target.value === 'true' })} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                        <option value="true">Aktif</option>
                        <option value="false">Pasif</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  İptal
                </button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  {editingItem ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
