// Supabase configuration
export const SUPABASE_URL = "https://dovjyljeoemdgnwykbhy.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdmp5bGplb2VtZGdud3lrYmh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MDI4NDEsImV4cCI6MjA2MjQ3ODg0MX0.O4rmWu687zVkJ-FJCBQfnBuyH7SEWISghzkK2C-oGxU";

// ===== ALOJA-T THEME SYSTEM =====
// Colores principales del gradiente del logo
const BRAND_COLORS = {
  primary: {
    400: "#FFCA28", // Amarillo principal
    600: "#FFB300", // Naranja
    700: "#FF8F00", // Naranja medio
    900: "#E65100", // Rojo-naranja
  },
  accent: {
    400: "#66BB6A", // Verde de las hojas
    500: "#4CAF50", // Verde vibrante
  },
};

// Tema claro
const LIGHT_THEME = {
  primary: BRAND_COLORS.primary[400],
  accent: BRAND_COLORS.accent[400],
  background: "#FFFFFF",
  surface: "#F8F9FA",
  onBackground: "#1A1A1A",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  shadow: "rgba(0, 0, 0, 0.1)",
  error: "#EF4444",
  success: "#10B981",
  warning: "#F59E0B",
  info: "#3B82F6",
};

// Tema oscuro
const DARK_THEME = {
  primary: "#FFD54F", // Amarillo más suave
  accent: "#81C784", // Verde más suave
  background: "#0F0F0F",
  surface: "#1A1A1A",
  onBackground: "#FFFFFF",
  textSecondary: "#A1A1AA",
  border: "#374151",
  shadow: "rgba(0, 0, 0, 0.3)",
  error: "#F87171",
  success: "#34D399",
  warning: "#FBBF24",
  info: "#60A5FA",
};

// Colores específicos de Aloja-T
const COMPONENT_COLORS = {
  property: {
    available: "#4CAF50", // Verde
    reserved: "#FFB300", // Naranja
    occupied: "#6B7280", // Gris
    pending: "#FFCA28", // Amarillo
  },
  user: {
    student: "#FFC107", // Amarillo
    owner: "#4CAF50", // Verde
    admin: "#8B5CF6", // Púrpura
  },
  status: {
    active: "#10B981",
    inactive: "#6B7280",
    pending: "#F59E0B",
    rejected: "#EF4444",
  },
};

// Sistema de tema completo
export const THEME = {
  light: LIGHT_THEME,
  dark: DARK_THEME,
  brand: BRAND_COLORS,
  components: COMPONENT_COLORS,
  getCurrentTheme: (isDark) => (isDark ? DARK_THEME : LIGHT_THEME),
};

// Mantener COLORS para compatibilidad con código existente
export const COLORS = {
  primary: BRAND_COLORS.primary[400],
  primaryLight: `${BRAND_COLORS.primary[400]}40`, // Con transparencia
  secondary: BRAND_COLORS.accent[500],
  accent: BRAND_COLORS.primary[600],
  error: LIGHT_THEME.error,
  background: LIGHT_THEME.background,
  text: LIGHT_THEME.onBackground,
  lightGray: LIGHT_THEME.surface,
  darkGray: LIGHT_THEME.textSecondary,
  white: "#FFFFFF",
  black: "#000000",
};

// Property types
export const PROPERTY_TYPES = ["apartamento", "habitación", "casa"];

// Common amenities
export const AMENITIES = [
  "wifi",
  "cocina",
  "lavandería",
  "aire acondicionado",
  "calefacción",
  "televisión",
  "estacionamiento",
  "piscina",
  "gimnasio",
];

// Opciones de ordenamiento
export const SORT_OPTIONS = [
  { value: "newest", label: "Más recientes" },
  { value: "oldest", label: "Más antiguos" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
];

// Rangos de precio predefinidos (en USD)
export const PRICE_RANGES = [
  { min: 0, max: 50, label: "Hasta $50" },
  { min: 50, max: 100, label: "$50 - $100" },
  { min: 100, max: 150, label: "$100 - $150" },
  { min: 150, max: 200, label: "$150 - $200" },
  { min: 200, max: 250, label: "$200 - $250" },
  { min: 250, max: null, label: "Más de $250" },
];

// Opciones de capacidad
export const CAPACITY_OPTIONS = [
  { value: 1, label: "1 persona" },
  { value: 2, label: "2 personas" },
  { value: 3, label: "3 personas" },
  { value: 4, label: "4 personas" },
  { value: 5, label: "5+ personas" },
];

// Payment methods
export const PAYMENT_METHODS = [
  "transferencia bancaria",
  "efectivo",
  "pago móvil",
];
