import { create } from 'zustand';

const usePermissionsStore = create((set) => ({
  permissions: [],

  setPermissions: (newPermissions) => {
    set({ permissions: newPermissions });
  },
}));

export default usePermissionsStore;