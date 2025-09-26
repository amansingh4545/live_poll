// frontend/src/redux/store.js (Updated)

import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice'; // <-- Import the user slice

export const store = configureStore({
  reducer: {
    user: userReducer, // <-- Register the user slice here
  },
});