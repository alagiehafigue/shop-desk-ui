export const roleAccess = {
  admin: [
    "dashboard",
    "sales",
    "products",
    "inventory",
    "customers",
    "reports",
    "payments",
    "users",
  ],
  manager: [
    "dashboard",
    "sales",
    "products",
    "inventory",
    "customers",
    "reports",
    "payments",
  ],
  cashier: ["dashboard", "sales"],
};

export function canAccess(user, feature) {
  if (!user?.role) {
    return false;
  }

  return roleAccess[user.role]?.includes(feature) ?? false;
}
