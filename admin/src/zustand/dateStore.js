import { create } from 'zustand';

const currentDate = new Date();
const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

const useDateStore = create((set) => ({
  useStore: false,
  startDateStore: firstDayOfMonth,
  endDateStore: lastDayOfMonth,
  setStartDate: (date) => set({ startDate: date }),
  setEndDate: (date) => set({ endDate: date }),
  setUseStore: (data) => set({ useStore: data })
}));

export default useDateStore;