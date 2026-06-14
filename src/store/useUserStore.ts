import { create } from 'zustand';
import type { User, UserRole } from '@/types';

interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
  canAccessBuilding: (buildingId: string) => boolean;
  canAccessHouse: (houseId: string) => boolean;
  setCurrentUser: (user: User | null) => void;
}

const mockUsers: User[] = [
  {
    id: 'U001',
    username: 'tenant',
    name: '张三',
    role: 'tenant',
    phone: '13800138001',
    buildingId: 'B001',
    houseId: 'B001-01A'
  },
  {
    id: 'U002',
    username: 'property',
    name: '李物业',
    role: 'property',
    phone: '13800138002',
    buildingId: 'B001'
  },
  {
    id: 'U003',
    username: 'staff',
    name: '王街道',
    role: 'staff',
    phone: '13800138003',
    district: '朝阳区'
  },
  {
    id: 'U004',
    username: 'district',
    name: '赵区长',
    role: 'district_director',
    phone: '13800138004',
    district: '朝阳区'
  },
  {
    id: 'U005',
    username: 'city',
    name: '孙市长',
    role: 'city_director',
    phone: '13800138005',
    city: '北京市'
  }
];

const roleHierarchy: Record<UserRole, number> = {
  tenant: 0,
  property: 1,
  staff: 2,
  district_director: 3,
  city_director: 4
};

const useUserStore = create<UserState>((set, get) => ({
  currentUser: null,
  isAuthenticated: false,

  login: async (username, password) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = mockUsers.find((u) => u.username === username);

    if (user && password === '123456') {
      set({
        currentUser: user,
        isAuthenticated: true
      });
      return true;
    }

    return false;
  },

  logout: () => {
    set({
      currentUser: null,
      isAuthenticated: false
    });
  },

  hasPermission: (requiredRole) => {
    const { currentUser } = get();
    if (!currentUser) return false;

    const userLevel = roleHierarchy[currentUser.role];

    if (Array.isArray(requiredRole)) {
      return requiredRole.some((role) => userLevel >= roleHierarchy[role]);
    }

    return userLevel >= roleHierarchy[requiredRole];
  },

  canAccessBuilding: (buildingId) => {
    const { currentUser, hasPermission } = get();
    if (!currentUser) return false;

    if (hasPermission('district_director')) {
      return true;
    }

    if (currentUser.role === 'property' || currentUser.role === 'tenant') {
      return currentUser.buildingId === buildingId;
    }

    return true;
  },

  canAccessHouse: (houseId) => {
    const { currentUser, hasPermission } = get();
    if (!currentUser) return false;

    if (hasPermission('staff')) {
      return true;
    }

    if (currentUser.role === 'tenant') {
      return currentUser.houseId === houseId;
    }

    if (currentUser.role === 'property') {
      return houseId.startsWith(currentUser.buildingId || '');
    }

    return true;
  },

  setCurrentUser: (user) => {
    set({
      currentUser: user,
      isAuthenticated: !!user
    });
  }
}));

export default useUserStore;
