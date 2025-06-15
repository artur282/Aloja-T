// Supabase configuration
export const SUPABASE_URL = 'https://dovjyljeoemdgnwykbhy.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdmp5bGplb2VtZGdud3lrYmh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MDI4NDEsImV4cCI6MjA2MjQ3ODg0MX0.O4rmWu687zVkJ-FJCBQfnBuyH7SEWISghzkK2C-oGxU';

// App color scheme
export const COLORS = {
  primary: '#3498db',
  secondary: '#2ecc71',
  accent: '#f1c40f',
  error: '#e74c3c',
  background: '#f9f9f9',
  text: '#2c3e50',
  lightGray: '#ecf0f1',
  darkGray: '#95a5a6',
  white: '#ffffff',
  black: '#000000',
};

// Property types
export const PROPERTY_TYPES = [
  'apartamento',
  'habitación',
  'casa',
];

// Common amenities
export const AMENITIES = [
  'wifi',
  'cocina',
  'lavandería',
  'aire acondicionado',
  'calefacción',
  'televisión',
  'estacionamiento',
  'piscina',
  'gimnasio',
];



// Opciones de ordenamiento
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'oldest', label: 'Más antiguos' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
];

// Rangos de precio predefinidos (en USD)
export const PRICE_RANGES = [
  { min: 0, max: 50, label: 'Hasta $50' },
  { min: 50, max: 100, label: '$50 - $100' },
  { min: 100, max: 150, label: '$100 - $150' },
  { min: 150, max: 200, label: '$150 - $200' },
  { min: 200, max: 250, label: '$200 - $250' },
  { min: 250, max: null, label: 'Más de $250' },
];

// Opciones de capacidad
export const CAPACITY_OPTIONS = [
  { value: 1, label: '1 persona' },
  { value: 2, label: '2 personas' },
  { value: 3, label: '3 personas' },
  { value: 4, label: '4 personas' },
  { value: 5, label: '5+ personas' },
];

// Payment methods
export const PAYMENT_METHODS = [
  'transferencia bancaria',
  'efectivo',
  'pago móvil'
];
