
Viewed
Original file line number	Diff line number	Diff line change
@@ -1,3 +1,4 @@
```javascript
import { createSlice } from "@reduxjs/toolkit";
const initialState = {
@@ -9,9 +10,14 @@ const todoSlice = createSlice({
  initialState,
  reducers: {
    addTodo: (state, action) => {
      const { text } = action.payload;
      if (typeof text !== 'string' || text.trim() === '') {
        return state; 
      }
      const newTask = { id: Date.now(), text }; 
      return {
        ...state,
        tasks: [...state.tasks, { id: 22, text: { hjvjbad } }],
        tasks: [...state.tasks, newTask],
      };
    },
    deleteTodo: (state, action) => {
@@ -23,3 +29,4 @@ const todoSlice = createSlice({
export const { addTodo, deleteTodo } = todoSlice.actions;
export default todoSlice.reducer;
```