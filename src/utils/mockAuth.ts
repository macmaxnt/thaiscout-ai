// Local mock user storage / simulated database for prototype

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: "creator";
  avatar?: string;
  password?: string;
  createdAt: string;
}

const DEFAULT_USERS: MockUser[] = [
  {
    id: "user-1",
    name: "มินท์ N (Creator)",
    email: "creator@travel-location.test",
    role: "creator",
    avatar: "M",
    password: "password123",
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "user-2",
    name: "ทีมงานกองถ่ายสยาม",
    email: "production@siamfilms.test",
    role: "creator",
    avatar: "S",
    password: "password123",
    createdAt: "2025-01-02T00:00:00.000Z",
  },
  {
    id: "user-3",
    name: "ผู้กำกับอาร์ท (Art Director)",
    email: "artdir@recce-scout.test",
    role: "creator",
    avatar: "A",
    password: "password123",
    createdAt: "2025-01-03T00:00:00.000Z",
  },
];

const STORAGE_USERS_KEY = "thaiscout_mock_users_table";
const STORAGE_CURRENT_USER_KEY = "thaiscout_active_session";

export function getMockUsers(): MockUser[] {
  if (typeof window === "undefined") return DEFAULT_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw);
    // filter out any old owner accounts if existed
    const creatorsOnly = parsed.filter((u: any) => u.role !== "owner");
    return creatorsOnly.length > 0 ? creatorsOnly : DEFAULT_USERS;
  } catch {
    return DEFAULT_USERS;
  }
}

export function registerMockUser(newUser: Omit<MockUser, "id" | "createdAt" | "role">): { success: boolean; error?: string; user?: MockUser } {
  const users = getMockUsers();
  const exists = users.some((u) => u.email.toLowerCase() === newUser.email.toLowerCase());
  if (exists) {
    return { success: false, error: "อีเมลนี้ถูกลงทะเบียนไว้แล้วในระบบ" };
  }

  const user: MockUser = {
    ...newUser,
    role: "creator",
    id: "user-" + Date.now(),
    createdAt: new Date().toISOString(),
    avatar: newUser.name ? newUser.name.trim().charAt(0).toUpperCase() : "U",
  };

  const updated = [...users, user];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
  }
  return { success: true, user };
}

export function authenticateMockUser(email: string, password?: string): { success: boolean; error?: string; user?: MockUser } {
  const users = getMockUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    // If not found in table, auto-register them seamlessly for prototype convenience
    const name = email.split("@")[0];
    const res = registerMockUser({ name, email, password: password || "123456" });
    return res;
  }

  if (password && user.password && user.password !== password) {
    return { success: false, error: "รหัสผ่านไม่ถูกต้อง (ตัวอย่างรหัสผ่าน: password123)" };
  }

  return { success: true, user };
}

export function getCurrentSession(): MockUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (user.role === "owner") return null; // purge old owner session
    return user;
  } catch {
    return null;
  }
}

export function setCurrentSession(user: MockUser | null) {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
  }
}
