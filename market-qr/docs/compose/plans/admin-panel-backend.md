# Admin Panel & Backend API — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the Market QR admin panel and backend API by implementing the missing Users CRUD module on the backend and adding Promotions and Users management pages to the admin panel.

**Architecture:** The backend is a NestJS app (`apps/backend`) with module-per-domain architecture. The admin panel is a Vite+React+Tailwind app (`apps/admin`) with page-per-route and a shared API client. All Prisma models and shared types already exist.

**Tech Stack:** NestJS 10, Prisma 5 (SQLite), React 18, Vite 5, Tailwind CSS 3, react-router-dom 6, lucide-react, class-validator

## Global Constraints

- Backend runs on port 3001, global prefix `/api/v1`
- Admin panel runs on port 3002 (Vite dev server)
- API base URL in admin: `http://localhost:3001/api/v1`
- Database: SQLite via Prisma (`packages/database/prisma/schema.prisma`)
- Shared types: `packages/types/src/index.ts`
- Auth: JWT with bcryptjs, roles: ADMIN, STAFF, CUSTOMER
- All write endpoints require ADMIN role guard
- Turkish UI labels for all admin panel text

---

## File Structure

### Backend (apps/backend/src/)

| File | Action | Purpose |
|------|--------|---------|
| `modules/users/users.controller.ts` | Create | Users CRUD endpoints |
| `modules/users/users.service.ts` | Create | Users business logic + Prisma queries |
| `modules/users/users.module.ts` | Modify | Register controller + service, import AuthModule for guards |

### Admin Panel (apps/admin/src/)

| File | Action | Purpose |
|------|--------|---------|
| `pages/Promotions.tsx` | Create | Promotions CRUD page with coupon management |
| `pages/Users.tsx` | Create | Users CRUD page with role management |
| `lib/api.ts` | Modify | Add `usersApi` export |
| `App.tsx` | Modify | Add routes for `/promotions` and `/users` |
| `components/Sidebar.tsx` | Modify | Add navigation items for Promotions and Users |

---

### Task 1: Backend Users Service

**Covers:** S2.7

**Files:**
- Create: `apps/backend/src/modules/users/users.service.ts`

**Interfaces:**
- Consumes: `PrismaService` from `../../config/prisma.service`
- Produces: `UsersService` class with methods: `findAll(query)`, `findOne(id)`, `create(dto)`, `update(id, dto)`, `remove(id)`, `updateRole(id, role)`

- [ ] **Step 1: Create users service with Prisma queries**

```typescript
// apps/backend/src/modules/users/users.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; role?: string; search?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    if (query.role) where.role = query.role;
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search } },
        { lastName: { contains: query.search } },
        { email: { contains: query.search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          storeId: true,
          avatarUrl: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          store: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        storeId: true,
        avatarUrl: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        store: { select: { id: true, name: true } },
      },
    });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');
    return user;
  }

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
    storeId?: string;
  }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Bu e-posta adresi zaten kayıtlı');

    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role || 'STAFF',
        storeId: data.storeId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        storeId: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  }

  async update(id: string, data: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    storeId?: string;
    avatarUrl?: string;
    isActive?: boolean;
  }) {
    await this.findOne(id);

    if (data.email) {
      const existing = await this.prisma.user.findFirst({
        where: { email: data.email, id: { not: id } },
      });
      if (existing) throw new ConflictException('Bu e-posta adresi zaten kullanımda');
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        storeId: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
    return { message: 'Kullanıcı başarıyla devre dışı bırakıldı' };
  }

  async updateRole(id: string, role: string) {
    await this.findOne(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
    return user;
  }
}
```

- [ ] **Step 2: Verify service compiles**

Run: `npx tsc --noEmit --project apps/backend/tsconfig.json`
Expected: No errors related to users.service.ts

---

### Task 2: Backend Users Controller

**Covers:** S2.7

**Files:**
- Create: `apps/backend/src/modules/users/users.controller.ts`

**Interfaces:**
- Consumes: `UsersService` from `./users.service`
- Produces: REST endpoints at `/users` prefix

- [ ] **Step 1: Create users controller with endpoint handlers**

```typescript
// apps/backend/src/modules/users/users.controller.ts
import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Kullanıcıları listele' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: string,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      role,
      search,
    });
  }

  @Get(':id')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Kullanıcı detayı' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Yeni kullanıcı oluştur' })
  create(@Body() body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
    storeId?: string;
  }) {
    return this.usersService.create(body);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Kullanıcı güncelle' })
  update(@Param('id') id: string, @Body() body: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    storeId?: string;
    avatarUrl?: string;
    isActive?: boolean;
  }) {
    return this.usersService.update(id, body);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Kullanıcıyı devre dışı bırak' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Put(':id/role')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Kullanıcı rolünü güncelle' })
  updateRole(@Param('id') id: string, @Body('role') role: string) {
    return this.usersService.updateRole(id, role);
  }
}
```

- [ ] **Step 2: Verify controller compiles**

Run: `npx tsc --noEmit --project apps/backend/tsconfig.json`
Expected: No errors related to users.controller.ts

---

### Task 3: Backend Users Module Registration

**Covers:** S2.7

**Files:**
- Modify: `apps/backend/src/modules/users/users.module.ts`

**Interfaces:**
- Consumes: `UsersService`, `UsersController`
- Produces: Registered module importable by AppModule

- [ ] **Step 1: Update users module to register controller and service**

```typescript
// apps/backend/src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
```

- [ ] **Step 2: Verify AppModule compiles with updated UsersModule**

Run: `npx tsc --noEmit --project apps/backend/tsconfig.json`
Expected: No compilation errors

- [ ] **Step 3: Commit backend changes**

```bash
git add apps/backend/src/modules/users/
git commit -m "feat(backend): add users CRUD module with controller and service"
```

---

### Task 4: Admin Panel — Users API Client

**Covers:** S2.7, S3

**Files:**
- Modify: `apps/admin/src/lib/api.ts`

**Interfaces:**
- Consumes: existing `api<T>()` helper function
- Produces: `usersApi` object with methods: `list()`, `get()`, `create()`, `update()`, `delete()`, `updateRole()`

- [ ] **Step 1: Add usersApi to api.ts**

Append to the end of `apps/admin/src/lib/api.ts` (before the last closing brace or at file end):

```typescript
export const usersApi = {
  list: (page = 1, limit = 20, role?: string, search?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (role) params.set('role', role);
    if (search) params.set('search', search);
    return api(`/users?${params}`);
  },
  get: (id: string) => api(`/users/${id}`),
  create: (data: any) => api('/users', { method: 'POST', body: data }),
  update: (id: string, data: any) =>
    api(`/users/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => api(`/users/${id}`, { method: 'DELETE' }),
  updateRole: (id: string, role: string) =>
    api(`/users/${id}/role`, { method: 'PUT', body: { role } }),
};
```

- [ ] **Step 2: Verify admin compiles**

Run: `npx tsc --noEmit` in `apps/admin/`
Expected: No errors

---

### Task 5: Admin Panel — Users Page

**Covers:** S3.4 (Users)

**Files:**
- Create: `apps/admin/src/pages/Users.tsx`

**Interfaces:**
- Consumes: `usersApi` from `../lib/api`, `useAuth` from `../contexts/AuthContext`, `storesApi` from `../lib/api`
- Produces: React component `Users` with list/create/edit/delete/role-update functionality

- [ ] **Step 1: Create Users page component**

```tsx
// apps/admin/src/pages/Users.tsx
import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usersApi, storesApi } from '../lib/api';

const roleLabels: Record<string, string> = {
  ADMIN: 'Yönetici',
  STAFF: 'Personel',
  CUSTOMER: 'Müşteri',
};

const roleColors: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-800',
  STAFF: 'bg-blue-100 text-blue-800',
  CUSTOMER: 'bg-gray-100 text-gray-800',
};

export default function Users() {
  const { token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [filterRole, setFilterRole] = useState('');
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'STAFF',
    storeId: '',
  });

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    if (!token) return;
    try {
      const [usersResponse, storesResponse] = await Promise.all([
        usersApi.list(1, 50),
        storesApi.list(),
      ]);
      setUsers(usersResponse.data || []);
      setStores(Array.isArray(storesResponse) ? storesResponse : storesResponse.data || []);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async (role?: string, searchTerm?: string) => {
    try {
      const response = await usersApi.list(1, 50, role || undefined, searchTerm || undefined);
      setUsers(response.data || []);
    } catch (error) {
      console.error('Users error:', error);
    }
  };

  const handleFilterChange = async (role: string) => {
    setFilterRole(role);
    await loadUsers(role, search);
  };

  const handleSearch = async (term: string) => {
    setSearch(term);
    await loadUsers(filterRole, term);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ email: '', password: '', firstName: '', lastName: '', phone: '', role: 'STAFF', storeId: '' });
    setShowModal(true);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setFormData({
      email: user.email || '',
      password: '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      role: user.role || 'STAFF',
      storeId: user.storeId || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      if (editingUser) {
        const updateData: any = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || null,
          storeId: formData.storeId || null,
        };
        if (formData.email) updateData.email = formData.email;
        await usersApi.update(editingUser.id, updateData);
      } else {
        await usersApi.create({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || undefined,
          role: formData.role,
          storeId: formData.storeId || undefined,
        });
      }
      setShowModal(false);
      await loadUsers(filterRole, search);
    } catch (error: any) {
      alert(error.message || 'İşlem başarısız');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı devre dışı bırakmak istediğinize emin misiniz?')) return;
    try {
      await usersApi.delete(userId);
      await loadUsers(filterRole, search);
    } catch (error: any) {
      alert(error.message || 'Silme başarısız');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Kullanıcı rolünü "${roleLabels[newRole] || newRole}" olarak değiştirmek istediğinize emin misiniz?`)) return;
    try {
      await usersApi.updateRole(userId, newRole);
      await loadUsers(filterRole, search);
    } catch (error: any) {
      alert(error.message || 'Rol güncellenemedi');
    }
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
        <h2 className="text-2xl font-bold">Kullanıcılar</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ara..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2"
          />
          <select
            value={filterRole}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="">Tüm Roller</option>
            <option value="ADMIN">Yönetici</option>
            <option value="STAFF">Personel</option>
            <option value="CUSTOMER">Müşteri</option>
          </select>
          <button
            onClick={openCreateModal}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
          >
            <Plus size={20} />
            Yeni Kullanıcı
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad Soyad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-posta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mağaza</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Kullanıcı bulunamadı
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[user.role] || 'bg-gray-100 text-gray-800'}`}>
                      {roleLabels[user.role] || user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.store?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleRoleChange(user.id, user.role === 'ADMIN' ? 'STAFF' : 'ADMIN')}
                        className="text-purple-600 hover:text-purple-900"
                        title="Rol Değiştir"
                      >
                        <Shield size={18} />
                      </button>
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="ADMIN">Yönetici</option>
                  <option value="STAFF">Personel</option>
                  <option value="CUSTOMER">Müşteri</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mağaza</label>
                <select
                  value={formData.storeId}
                  onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Mağaza seçin</option>
                  {stores.map((store: any) => (
                    <option key={store.id} value={store.id}>{store.name}</option>
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
                  {editingUser ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify Users page compiles**

Run: `npx tsc --noEmit` in `apps/admin/`
Expected: No errors

---

### Task 6: Admin Panel — Promotions Page

**Covers:** S3.4 (Promotions)

**Files:**
- Create: `apps/admin/src/pages/Promotions.tsx`

**Interfaces:**
- Consumes: `promotionsApi` from `../lib/api` (already exists), `useAuth` from `../contexts/AuthContext`
- Produces: React component `Promotions` with list/create/edit/delete/toggle + coupon management

- [ ] **Step 1: Create Promotions page component**

```tsx
// apps/admin/src/pages/Promotions.tsx
import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, ToggleLeft, ToggleRight, Tag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { promotionsApi } from '../lib/api';

const discountTypeLabels: Record<string, string> = {
  PERCENTAGE: 'Yüzde',
  FIXED: 'Sabit Tutar',
};

export default function Promotions() {
  const { token } = useAuth();
  const [promotions, setPromotions] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'promotions' | 'coupons'>('promotions');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    startDate: '',
    endDate: '',
    targetCategoryId: '',
    usageLimit: '',
  });
  const [couponForm, setCouponForm] = useState({
    code: '',
    promotionId: '',
    usageLimit: '1',
    minAmount: '',
    expiresAt: '',
  });

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    if (!token) return;
    try {
      const [promoResponse, couponResponse] = await Promise.all([
        promotionsApi.list(),
        promotionsApi.listCoupons(),
      ]);
      setPromotions(Array.isArray(promoResponse) ? promoResponse : promoResponse.data || []);
      setCoupons(Array.isArray(couponResponse) ? couponResponse : couponResponse.data || []);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPromo(null);
    setFormData({
      title: '', description: '', discountType: 'PERCENTAGE',
      discountValue: '', startDate: '', endDate: '', targetCategoryId: '', usageLimit: '',
    });
    setShowModal(true);
  };

  const openEditModal = (promo: any) => {
    setEditingPromo(promo);
    setFormData({
      title: promo.title || '',
      description: promo.description || '',
      discountType: promo.discountType || 'PERCENTAGE',
      discountValue: String(promo.discountValue || ''),
      startDate: promo.startDate ? new Date(promo.startDate).toISOString().split('T')[0] : '',
      endDate: promo.endDate ? new Date(promo.endDate).toISOString().split('T')[0] : '',
      targetCategoryId: promo.targetCategoryId || '',
      usageLimit: String(promo.usageLimit || ''),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const data = {
        title: formData.title,
        description: formData.description || undefined,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        targetCategoryId: formData.targetCategoryId || undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
      };

      if (editingPromo) {
        await promotionsApi.update(editingPromo.id, data);
      } else {
        await promotionsApi.create(data);
      }
      setShowModal(false);
      await loadData();
    } catch (error: any) {
      alert(error.message || 'İşlem başarısız');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu promosyonu silmek istediğinize emin misiniz?')) return;
    try {
      await promotionsApi.delete(id);
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Silme başarısız');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await promotionsApi.toggleActive(id);
      await loadData();
    } catch (error: any) {
      alert(error.message || 'İşlem başarısız');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      await promotionsApi.createCoupon({
        code: couponForm.code,
        promotionId: couponForm.promotionId,
        usageLimit: parseInt(couponForm.usageLimit) || 1,
        minAmount: couponForm.minAmount ? parseFloat(couponForm.minAmount) : undefined,
        expiresAt: couponForm.expiresAt ? new Date(couponForm.expiresAt).toISOString() : undefined,
      });
      setShowCouponModal(false);
      setCouponForm({ code: '', promotionId: '', usageLimit: '1', minAmount: '', expiresAt: '' });
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Kupon oluşturulamadı');
    }
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
        <h2 className="text-2xl font-bold">Promosyonlar & Kuponlar</h2>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('promotions')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'promotions' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
            >
              Promosyonlar
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'coupons' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
            >
              Kuponlar
            </button>
          </div>
          {activeTab === 'promotions' ? (
            <button
              onClick={openCreateModal}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
            >
              <Plus size={20} />
              Yeni Promosyon
            </button>
          ) : (
            <button
              onClick={() => {
                setCouponForm({ code: '', promotionId: promotions[0]?.id || '', usageLimit: '1', minAmount: '', expiresAt: '' });
                setShowCouponModal(true);
              }}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
            >
              <Tag size={20} />
              Yeni Kupon
            </button>
          )}
        </div>
      </div>

      {activeTab === 'promotions' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İndirim</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih Aralığı</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanım</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {promotions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Promosyon bulunamadı</td>
                </tr>
              ) : (
                promotions.map((promo) => (
                  <tr key={promo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{promo.title}</div>
                      {promo.description && <div className="text-xs text-gray-500">{promo.description}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {promo.discountType === 'PERCENTAGE' ? `%${promo.discountValue}` : `₺${promo.discountValue}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(promo.startDate).toLocaleDateString('tr-TR')} - {new Date(promo.endDate).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {promo.usedCount || 0} / {promo.usageLimit || '∞'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => handleToggle(promo.id)} className="flex items-center">
                        {promo.isActive ? (
                          <ToggleRight size={24} className="text-green-500" />
                        ) : (
                          <ToggleLeft size={24} className="text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(promo)} className="text-gray-600 hover:text-gray-900">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(promo.id)} className="text-red-600 hover:text-red-900">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'coupons' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kod</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Promosyon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanım</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min. Tutar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bitiş</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Kupon bulunamadı</td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{coupon.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{coupon.promotion?.title || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{coupon.usedCount} / {coupon.usageLimit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{coupon.minAmount ? `₺${coupon.minAmount}` : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('tr-TR') : 'Süresiz'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {coupon.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Promotion Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editingPromo ? 'Promosyon Düzenle' : 'Yeni Promosyon'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">İndirim Tipi</label>
                  <select value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    <option value="PERCENTAGE">Yüzde (%)</option>
                    <option value="FIXED">Sabit Tutar (₺)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Değer</label>
                  <input type="number" step="0.01" value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç</label>
                  <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş</label>
                  <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kullanım Limiti</label>
                <input type="number" value={formData.usageLimit} onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Sınırsız" />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">İptal</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">{editingPromo ? 'Güncelle' : 'Oluştur'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Yeni Kupon Oluştur</h3>
              <button onClick={() => setShowCouponModal(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kupon Kodu</label>
                <input type="text" value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} className="w-full border border-gray-300 rounded-lg px-3 py-2 uppercase" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Promosyon</label>
                <select value={couponForm.promotionId} onChange={(e) => setCouponForm({ ...couponForm, promotionId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                  <option value="">Promosyon seçin</option>
                  {promotions.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kullanım Limiti</label>
                  <input type="number" value={couponForm.usageLimit} onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min. Tutar (₺)</label>
                  <input type="number" step="0.01" value={couponForm.minAmount} onChange={(e) => setCouponForm({ ...couponForm, minAmount: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
                <input type="date" value={couponForm.expiresAt} onChange={(e) => setCouponForm({ ...couponForm, expiresAt: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowCouponModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">İptal</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Oluştur</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify Promotions page compiles**

Run: `npx tsc --noEmit` in `apps/admin/`
Expected: No errors

---

### Task 7: Admin Panel — Route & Navigation Updates

**Covers:** S3.3, S3.4

**Files:**
- Modify: `apps/admin/src/App.tsx`
- Modify: `apps/admin/src/components/Sidebar.tsx`

**Interfaces:**
- Consumes: `Promotions` component, `Users` component
- Produces: Updated routes and sidebar nav items

- [ ] **Step 1: Add Promotions and Users imports and routes to App.tsx**

In `apps/admin/src/App.tsx`, add imports after the existing imports:

```tsx
import Promotions from './pages/Promotions';
import Users from './pages/Users';
```

Add routes inside the `<Route path="/" element={...}>` block, after the existing `<Route path="stores" ...>`:

```tsx
<Route path="promotions" element={<Promotions />} />
<Route path="users" element={<Users />} />
```

- [ ] **Step 2: Add Promotions and Users to Sidebar navigation**

In `apps/admin/src/components/Sidebar.tsx`, add imports:

```tsx
import { Megaphone, Users as UsersIcon } from 'lucide-react';
```

Add nav items to the `navItems` array after the stores entry:

```tsx
{ to: '/promotions', icon: Megaphone, label: 'Promosyonlar' },
{ to: '/users', icon: UsersIcon, label: 'Kullanıcılar' },
```

- [ ] **Step 3: Verify full admin app compiles**

Run: `npx tsc --noEmit` in `apps/admin/`
Expected: No errors

- [ ] **Step 4: Commit admin changes**

```bash
git add apps/admin/src/pages/Promotions.tsx apps/admin/src/pages/Users.tsx apps/admin/src/lib/api.ts apps/admin/src/App.tsx apps/admin/src/components/Sidebar.tsx
git commit -m "feat(admin): add Promotions and Users management pages with routing"
```

---

### Task 8: End-to-End Verification

**Covers:** S1, S2, S3

**Files:**
- No new files

**Interfaces:**
- Consumes: All completed tasks
- Produces: Verified working backend and admin

- [ ] **Step 1: Start backend dev server**

Run in `apps/backend/`: `npm run dev`
Expected: Server starts on port 3001, Swagger available at http://localhost:3001/api/docs

- [ ] **Step 2: Test Users API endpoints**

```bash
# Login first to get token
curl -X POST http://localhost:3001/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"admin@marketqr.com","password":"admin123"}'

# List users (use token from login)
curl http://localhost:3001/api/v1/users -H "Authorization: Bearer <token>"

# Create user
curl -X POST http://localhost:3001/api/v1/users -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test123","firstName":"Test","lastName":"User","role":"STAFF"}'
```
Expected: 200 responses with user data

- [ ] **Step 3: Start admin dev server**

Run in `apps/admin/`: `npm run dev`
Expected: Admin panel starts on port 3002

- [ ] **Step 4: Verify admin pages load**

Navigate to:
- http://localhost:3002/#/ — Dashboard loads with stats
- http://localhost:3002/#/promotions — Promotions page loads
- http://localhost:3002/#/users — Users page loads
- Login, create/edit/delete operations work for each entity
