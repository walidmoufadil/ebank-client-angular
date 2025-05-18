import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Enregistrer les composants Chart.js nécessaires
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Configuration globale par défaut
Chart.defaults.responsive = true;
Chart.defaults.maintainAspectRatio = false;

// Palette de couleurs personnalisée
export const chartColors = {
  primary: '#4F46E5',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  secondary: '#6B7280'
};

// Options communes pour tous les graphiques
export const commonOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom'
    },
    title: {
      display: true,
      font: {
        size: 16,
        weight: 'bold'
      }
    }
  }
};
