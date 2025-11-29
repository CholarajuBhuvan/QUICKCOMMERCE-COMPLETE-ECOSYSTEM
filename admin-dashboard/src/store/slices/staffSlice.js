import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  staff: [],
  currentStaffMember: null,
  loading: false,
  error: null,
  filters: {
    role: 'all',
    status: 'all',
    search: '',
    sortBy: 'name',
    sortOrder: 'asc'
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalStaff: 0,
    staffPerPage: 10
  },
  stats: {
    totalStaff: 0,
    activeStaff: 0,
    pickers: 0,
    riders: 0,
    admins: 0
  }
};

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setStaff: (state, action) => {
      state.staff = action.payload;
      state.loading = false;
      state.error = null;
    },
    addStaffMember: (state, action) => {
      state.staff.unshift(action.payload);
    },
    updateStaffMember: (state, action) => {
      const index = state.staff.findIndex(member => member._id === action.payload._id);
      if (index !== -1) {
        state.staff[index] = action.payload;
      }
      if (state.currentStaffMember && state.currentStaffMember._id === action.payload._id) {
        state.currentStaffMember = action.payload;
      }
    },
    deleteStaffMember: (state, action) => {
      state.staff = state.staff.filter(member => member._id !== action.payload);
      if (state.currentStaffMember && state.currentStaffMember._id === action.payload) {
        state.currentStaffMember = null;
      }
    },
    setCurrentStaffMember: (state, action) => {
      state.currentStaffMember = action.payload;
    },
    updatePerformance: (state, action) => {
      const { staffId, performance } = action.payload;
      const index = state.staff.findIndex(member => member._id === staffId);
      if (index !== -1) {
        state.staff[index].performance = { ...state.staff[index].performance, ...performance };
      }
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    clearCurrentStaffMember: (state) => {
      state.currentStaffMember = null;
    }
  }
});

export const {
  setLoading,
  setError,
  setStaff,
  addStaffMember,
  updateStaffMember,
  deleteStaffMember,
  setCurrentStaffMember,
  updatePerformance,
  setFilters,
  setPagination,
  setStats,
  clearCurrentStaffMember
} = staffSlice.actions;

export default staffSlice.reducer;
