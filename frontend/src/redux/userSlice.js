// frontend/src/redux/userSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name: '',       // Name of the user (Teacher or Student)
  role: null,     // Will be 'Teacher' or 'Student'
  isIdentified: false, // Flag to check if the user has been identified
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // This action saves the user's identity to the store
    setUser(state, action) {
      state.name = action.payload.name;
      state.role = action.payload.role;
      state.isIdentified = true;
    },
  },
});

// Export the action (to change state) and the reducer (to manage state)
export const { setUser } = userSlice.actions;
export default userSlice.reducer;