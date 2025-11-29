import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentRoute: null,
  optimizedWaypoints: [],
  estimatedDistance: 0,
  estimatedDuration: 0,
  currentLocation: null,
  destination: null,
  isNavigating: false,
  navigationError: null,
};

const routeSlice = createSlice({
  name: 'route',
  initialState,
  reducers: {
    setCurrentRoute: (state, action) => {
      state.currentRoute = action.payload;
    },
    
    setOptimizedWaypoints: (state, action) => {
      state.optimizedWaypoints = action.payload;
    },
    
    setEstimatedDistance: (state, action) => {
      state.estimatedDistance = action.payload;
    },
    
    setEstimatedDuration: (state, action) => {
      state.estimatedDuration = action.payload;
    },
    
    setCurrentLocation: (state, action) => {
      state.currentLocation = action.payload;
    },
    
    setDestination: (state, action) => {
      state.destination = action.payload;
    },
    
    startNavigation: (state) => {
      state.isNavigating = true;
      state.navigationError = null;
    },
    
    stopNavigation: (state) => {
      state.isNavigating = false;
      state.currentRoute = null;
      state.destination = null;
    },
    
    setNavigationError: (state, action) => {
      state.navigationError = action.payload;
      state.isNavigating = false;
    },
    
    clearRoute: (state) => {
      return initialState;
    },
  },
});

export const {
  setCurrentRoute,
  setOptimizedWaypoints,
  setEstimatedDistance,
  setEstimatedDuration,
  setCurrentLocation,
  setDestination,
  startNavigation,
  stopNavigation,
  setNavigationError,
  clearRoute,
} = routeSlice.actions;

export default routeSlice.reducer;

// Selectors
export const selectCurrentRoute = (state) => state.route.currentRoute;
export const selectOptimizedWaypoints = (state) => state.route.optimizedWaypoints;
export const selectEstimatedDistance = (state) => state.route.estimatedDistance;
export const selectEstimatedDuration = (state) => state.route.estimatedDuration;
export const selectCurrentLocation = (state) => state.route.currentLocation;
export const selectDestination = (state) => state.route.destination;
export const selectIsNavigating = (state) => state.route.isNavigating;
export const selectNavigationError = (state) => state.route.navigationError;
