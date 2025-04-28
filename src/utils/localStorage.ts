import { User, Sheet, SheetData } from '../types';

// Constants for localStorage keys
const USERS_KEY = 'whiteboard_users';
const CURRENT_USER_KEY = 'whiteboard_current_user';
const SHEETS_KEY = 'whiteboard_sheets';
const SHEET_DATA_PREFIX = 'whiteboard_sheet_data_';

// User functions
export const getUsers = (): User[] => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

export const saveUsers = (users: User[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

export const createUser = (username: string, password: string): User => {
  const users = getUsers();
  
  const newUser: User = {
    id: `user_${Date.now()}`,
    username,
    password, // In a real app, this would be hashed
    createdAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

export const authenticateUser = (username: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  return user || null;
};

// Sheet functions
export const getSheets = (userId?: string): Sheet[] => {
  const sheets = localStorage.getItem(SHEETS_KEY);
  const allSheets = sheets ? JSON.parse(sheets) : [];
  
  if (userId) {
    return allSheets.filter((sheet: Sheet) => sheet.userId === userId);
  }
  
  return allSheets;
};

export const saveSheets = (sheets: Sheet[]): void => {
  localStorage.setItem(SHEETS_KEY, JSON.stringify(sheets));
};

export const createSheet = (userId: string, name: string): Sheet => {
  const sheets = getSheets();
  
  const newSheet: Sheet = {
    id: `sheet_${Date.now()}`,
    name,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  sheets.push(newSheet);
  saveSheets(sheets);
  return newSheet;
};

export const updateSheet = (sheet: Sheet): void => {
  const sheets = getSheets();
  const index = sheets.findIndex((s: Sheet) => s.id === sheet.id);
  
  if (index !== -1) {
    sheets[index] = {
      ...sheet,
      updatedAt: new Date().toISOString()
    };
    saveSheets(sheets);
  }
};

export const deleteSheet = (sheetId: string): void => {
  const sheets = getSheets();
  const filteredSheets = sheets.filter((s: Sheet) => s.id !== sheetId);
  saveSheets(filteredSheets);
  
  // Also remove sheet data
  localStorage.removeItem(`${SHEET_DATA_PREFIX}${sheetId}`);
};

// Sheet data functions
export const getSheetData = (sheetId: string): SheetData | null => {
  const data = localStorage.getItem(`${SHEET_DATA_PREFIX}${sheetId}`);
  return data ? JSON.parse(data) : null;
};

export const saveSheetData = (sheetId: string, data: SheetData): void => {
  localStorage.setItem(`${SHEET_DATA_PREFIX}${sheetId}`, JSON.stringify(data));
  
  // Also update the sheet's updatedAt timestamp
  const sheets = getSheets();
  const sheet = sheets.find((s: Sheet) => s.id === sheetId);
  
  if (sheet) {
    updateSheet({
      ...sheet,
      updatedAt: new Date().toISOString()
    });
  }
};

// Initialize the app with a default admin user if it doesn't exist
export const initializeApp = (): void => {
  const users = getUsers();
  
  if (users.length === 0) {
    createUser('admin', '12345678');
  }
};