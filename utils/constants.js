// Supabase configuration
export const SUPABASE_URL = "https://dovjyljeoemdgnwykbhy.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdmp5bGplb2VtZGdud3lrYmh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MDI4NDEsImV4cCI6MjA2MjQ3ODg0MX0.O4rmWu687zVkJ-FJCBQfnBuyH7SEWISghzkK2C-oGxU";

// ===== ALOJA-T MODERN THEME SYSTEM =====
// Nueva paleta de colores moderna inspirada en Airbnb
const MODERN_COLORS = {
  primary: {
    50: "#FFF8E1",
    100: "#FFECB3",
    500: "#FF6B35", // Naranja vibrante principal
    600: "#E55A2B",
    900: "#BF360C",
  },
  neutral: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#EEEEEE",
    300: "#E0E0E0",
    500: "#9E9E9E",
    700: "#616161",
    900: "#212121",
  },
  accent: {
    pink: "#E91E63", // Para favoritos y acciones especiales
    green: "#4CAF50", // Para estados positivos
    blue: "#2196F3", // Para información
  },
};

// Mantener BRAND_COLORS para compatibilidad
const BRAND_COLORS = {
  primary: {
    400: MODERN_COLORS.primary[500], // Usar el nuevo color principal
    600: MODERN_COLORS.primary[600],
    700: "#FF8F00", // Mantener para compatibilidad
    900: MODERN_COLORS.primary[900],
  },
  accent: {
    400: MODERN_COLORS.accent.green,
    500: MODERN_COLORS.accent.green,
  },
};

// Tema claro moderno
const LIGHT_THEME = {
  primary: MODERN_COLORS.primary[500],
  accent: MODERN_COLORS.accent.green,
  background: "#FFFFFF",
  surface: MODERN_COLORS.neutral[50],
  surfaceElevated: "#FFFFFF",
  onBackground: MODERN_COLORS.neutral[900],
  textSecondary: MODERN_COLORS.neutral[500],
  textTertiary: MODERN_COLORS.neutral[300],
  border: MODERN_COLORS.neutral[200],
  borderLight: MODERN_COLORS.neutral[100],
  shadow: "rgba(0, 0, 0, 0.1)",
  shadowMedium: "rgba(0, 0, 0, 0.15)",
  shadowLarge: "rgba(0, 0, 0, 0.2)",
  error: "#EF4444",
  success: MODERN_COLORS.accent.green,
  warning: "#F59E0B",
  info: MODERN_COLORS.accent.blue,
  favorite: MODERN_COLORS.accent.pink,
};

// Tema oscuro moderno
const DARK_THEME = {
  primary: "#FF8A50", // Naranja más suave para modo oscuro
  accent: "#66BB6A", // Verde más suave
  background: "#0F0F0F",
  surface: "#1A1A1A",
  surfaceElevated: "#2A2A2A",
  onBackground: "#FFFFFF",
  textSecondary: "#A1A1AA",
  textTertiary: "#6B7280",
  border: "#374151",
  borderLight: "#2A2A2A",
  shadow: "rgba(0, 0, 0, 0.3)",
  shadowMedium: "rgba(0, 0, 0, 0.4)",
  shadowLarge: "rgba(0, 0, 0, 0.5)",
  error: "#F87171",
  success: "#34D399",
  warning: "#FBBF24",
  info: "#60A5FA",
  favorite: "#F48FB1",
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

// Sombras modernas
export const MODERN_SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
};

// Bordes redondeados
export const BORDER_RADIUS = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 24,
  round: 50,
};

// Espaciado consistente
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Sistema de tema completo modernizado
export const THEME = {
  light: LIGHT_THEME,
  dark: DARK_THEME,
  brand: BRAND_COLORS,
  modern: MODERN_COLORS,
  components: COMPONENT_COLORS,
  shadows: MODERN_SHADOWS,
  borderRadius: BORDER_RADIUS,
  spacing: SPACING,
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
