import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("scenthub.db");

export type UserRole = "owner" | "staff" | "cashier";

// Human-readable label for each role, used across the UI.
export function roleLabel(role: UserRole): string {
  if (role === "owner") return "Owner";
  if (role === "cashier") return "Cashier";
  return "Staff";
}

export type User = {
  id: number;
  username: string;
  full_name: string;
  role: UserRole;
};

export function initDB() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT,
      price REAL,
      quantity INTEGER
    );
  `);
  db.execSync(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      quantity_sold INTEGER,
      sale_date TEXT,
      total_price REAL,
      FOREIGN KEY (product_id) REFERENCES products (id)
    );
  `);
  db.execSync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      full_name TEXT,
      role TEXT NOT NULL DEFAULT 'staff'
    );
  `);
  db.execSync(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // --- Migration: add user_id to sales if this DB was created before
  // multi-user support existed. SQLite has no "ADD COLUMN IF NOT EXISTS",
  // so we just try it and ignore the error if the column is already there.
  try {
    db.execSync(`ALTER TABLE sales ADD COLUMN user_id INTEGER;`);
  } catch (e) {
    // column already exists — safe to ignore
  }

  seedDefaultOwner();
}

// Creates a first-run owner account so the app is never unusable out of
// the box. NOTE: passwords are stored as plain text here — fine for a
// school project demo, but a real deployment should hash these
// (e.g. with expo-crypto) before storing them.
function seedDefaultOwner() {
  const existing = db.getFirstSync("SELECT id FROM users LIMIT 1");
  if (!existing) {
    db.runSync(
      "INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)",
      ["owner", "owner123", "DXTR Owner", "owner"],
    );
  }
}

initDB(); // Run immediately when this file is imported

// ---------- Products ----------

export function addProduct(
  name: string,
  brand: string,
  price: number,
  quantity: number,
) {
  db.runSync(
    "INSERT INTO products (name, brand, price, quantity) VALUES (?, ?, ?, ?)",
    [name, brand, price, quantity],
  );
}

export function getProducts(): any[] {
  return db.getAllSync("SELECT * FROM products");
}

export function updateProduct(
  id: number,
  name: string,
  brand: string,
  price: number,
  quantity: number,
) {
  db.runSync(
    "UPDATE products SET name=?, brand=?, price=?, quantity=? WHERE id=?",
    [name, brand, price, quantity, id],
  );
}

export function deleteProduct(id: number) {
  db.runSync("DELETE FROM products WHERE id=?", [id]);
}

// ---------- Sales ----------
// recordSale now takes the id of whoever is logged in, so every sale
// is tied to the staff member / owner who made it.

export function recordSale(
  productId: number,
  qty: number,
  total: number,
  userId: number | null,
) {
  const date = new Date().toISOString();
  db.runSync(
    "INSERT INTO sales (product_id, quantity_sold, sale_date, total_price, user_id) VALUES (?, ?, ?, ?, ?)",
    [productId, qty, date, total, userId],
  );
  db.runSync("UPDATE products SET quantity = quantity - ? WHERE id = ?", [
    qty,
    productId,
  ]);
}

export function getSales(): any[] {
  return db.getAllSync(`
    SELECT s.*, u.full_name as sold_by
    FROM sales s
    LEFT JOIN users u ON s.user_id = u.id
    ORDER BY s.id DESC
  `);
}

export function deleteSale(id: number) {
  db.runSync("DELETE FROM sales WHERE id=?", [id]);
}

export function getTotalRevenue(): number {
  const result: any = db.getFirstSync(
    "SELECT SUM(total_price) as total FROM sales",
  );
  return result?.total || 0;
}

export function getTopSeller(): any {
  const result: any = db.getFirstSync(`
    SELECT p.name, p.brand, SUM(s.quantity_sold) as total_sold
    FROM sales s
    JOIN products p ON s.product_id = p.id
    GROUP BY s.product_id
    ORDER BY total_sold DESC
    LIMIT 1
  `);
  return result || null;
}

export function getRecentSales(limit: number = 3): any[] {
  return db.getAllSync(
    `
    SELECT s.*, p.name as product_name, u.full_name as sold_by
    FROM sales s
    LEFT JOIN products p ON s.product_id = p.id
    LEFT JOIN users u ON s.user_id = u.id
    ORDER BY s.id DESC
    LIMIT ?
  `,
    [limit],
  );
}

// ---------- Users / Auth ----------

export function verifyLogin(username: string, password: string): User | null {
  const result: any = db.getFirstSync(
    "SELECT id, username, full_name, role FROM users WHERE username = ? AND password = ?",
    [username, password],
  );
  return result || null;
}

export function getUsers(): User[] {
  return db.getAllSync(
    "SELECT id, username, full_name, role FROM users ORDER BY role, full_name",
  );
}

export function usernameExists(username: string): boolean {
  const result = db.getFirstSync("SELECT id FROM users WHERE username = ?", [
    username,
  ]);
  return !!result;
}

export function addUser(
  username: string,
  password: string,
  fullName: string,
  role: UserRole,
) {
  db.runSync(
    "INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)",
    [username, password, fullName, role],
  );
}

export function countOwners(): number {
  const result: any = db.getFirstSync(
    "SELECT COUNT(*) as count FROM users WHERE role = 'owner'",
  );
  return result?.count || 0;
}

export function deleteUser(id: number) {
  db.runSync("DELETE FROM users WHERE id=?", [id]);
}

// ---------- Settings ----------
// A generic key/value settings table. Right now it only holds the shop's
// display name, so the app isn't permanently hardcoded to "DXTR Parfum" —
// any perfume shop installing this app can set their own name.

export function getShopName(): string {
  const result: any = db.getFirstSync(
    "SELECT value FROM settings WHERE key = 'shop_name'",
  );
  return result?.value || "DXTR Parfum";
}

export function setShopName(name: string) {
  db.runSync(
    `INSERT INTO settings (key, value) VALUES ('shop_name', ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [name],
  );
}

// ---------- Saved login session ----------
// Keeps the person signed in after the app is closed. The session is dropped
// after 7 days of inactivity (the timer restarts every time the app is used),
// or immediately if that user account no longer exists.

export const SESSION_MAX_IDLE_MS = 7 * 24 * 60 * 60 * 1000;

function setSetting(key: string, value: string) {
  db.runSync(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, value],
  );
}

function getSetting(key: string): string | null {
  const result: any = db.getFirstSync(
    "SELECT value FROM settings WHERE key = ?",
    [key],
  );
  return result?.value ?? null;
}

export function saveSession(userId: number) {
  setSetting("session_user_id", String(userId));
  setSetting("session_last_active", String(Date.now()));
}

export function touchSession() {
  if (getSetting("session_user_id")) {
    setSetting("session_last_active", String(Date.now()));
  }
}

export function clearSession() {
  db.runSync(
    "DELETE FROM settings WHERE key IN ('session_user_id', 'session_last_active')",
  );
}

// Returns the saved user if the session is still valid, otherwise null.
export function getSavedSession(): User | null {
  const id = getSetting("session_user_id");
  const last = Number(getSetting("session_last_active") || 0);
  if (!id) return null;
  if (!last || Date.now() - last > SESSION_MAX_IDLE_MS) {
    clearSession();
    return null;
  }
  const user: any = db.getFirstSync(
    "SELECT id, username, full_name, role FROM users WHERE id = ?",
    [Number(id)],
  );
  if (!user) {
    clearSession();
    return null;
  }
  touchSession();
  return user;
}
