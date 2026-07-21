export interface ContentItem {
  id: number;
  title: string;
  sheikh: string;
  platform: string;
  contentType: string;
  duration: string;
  uploadDate: string;
  interactions: number;
  link: string;
}

export interface KPIStats {
  totalMaterials: number;
  totalInteractions: number;
  avgInteractions: number;
  uniqueSheikhsCount: number;
  uniquePlatformsCount: number;
}

export interface ChartDataPoint {
  name: string;
  count: number;
  interactions: number;
}

export interface TimelineDataPoint {
  year: string;
  count: number;
  interactions: number;
}

export interface DashboardStats {
  kpis: KPIStats;
  topSheikhs: ChartDataPoint[];
  platforms: ChartDataPoint[];
  contentTypes: ChartDataPoint[];
  timeline: TimelineDataPoint[];
}

export interface FilterOptions {
  sheikhs: { name: string; count: number }[];
  platforms: { name: string; count: number }[];
  contentTypes: { name: string; count: number }[];
}
