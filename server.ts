import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Load dataset
const datasetPath = path.resolve('src/data/dataset.json');
let rawDataset: any[] = [];
try {
  if (fs.existsSync(datasetPath)) {
    rawDataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
    console.log(`Loaded ${rawDataset.length} items from dataset.json`);
  } else {
    console.warn(`Dataset file not found at ${datasetPath}. Please run the fetch script.`);
  }
} catch (error) {
  console.error("Error loading dataset.json:", error);
}

// Helper to filter and sort data
function getFilteredData(filters: {
  search?: string;
  sheikh?: string;
  platform?: string;
  contentType?: string;
  minInteractions?: number;
}) {
  let data = [...rawDataset];

  if (filters.search) {
    const s = filters.search.toLowerCase();
    data = data.filter(item => 
      (item.title && item.title.toLowerCase().includes(s)) ||
      (item.sheikh && item.sheikh.toLowerCase().includes(s))
    );
  }

  if (filters.sheikh && filters.sheikh !== 'all') {
    data = data.filter(item => item.sheikh === filters.sheikh);
  }

  if (filters.platform && filters.platform !== 'all') {
    data = data.filter(item => item.platform === filters.platform);
  }

  if (filters.contentType && filters.contentType !== 'all') {
    data = data.filter(item => item.contentType === filters.contentType);
  }

  if (filters.minInteractions !== undefined) {
    data = data.filter(item => item.interactions >= (filters.minInteractions || 0));
  }

  return data;
}

// API: Get filter options (unique lists of Sheikhs, Platforms, Content Types)
app.get('/api/filters-options', (req, res) => {
  const sheikhsMap = new Map<string, number>();
  const platformsMap = new Map<string, number>();
  const contentTypesMap = new Map<string, number>();

  rawDataset.forEach(item => {
    if (item.sheikh) sheikhsMap.set(item.sheikh, (sheikhsMap.get(item.sheikh) || 0) + 1);
    if (item.platform) platformsMap.set(item.platform, (platformsMap.get(item.platform) || 0) + 1);
    if (item.contentType) contentTypesMap.set(item.contentType, (contentTypesMap.get(item.contentType) || 0) + 1);
  });

  const sheikhs = Array.from(sheikhsMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const platforms = Array.from(platformsMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const contentTypes = Array.from(contentTypesMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  res.json({ sheikhs, platforms, contentTypes });
});

// API: Get paginated/filtered data
app.get('/api/data', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 15;
  const search = (req.query.search as string) || '';
  const sheikh = (req.query.sheikh as string) || 'all';
  const platform = (req.query.platform as string) || 'all';
  const contentType = (req.query.contentType as string) || 'all';
  const sortBy = (req.query.sortBy as string) || 'interactions';
  const sortOrder = (req.query.sortOrder as string) || 'desc';

  let filtered = getFilteredData({ search, sheikh, platform, contentType });

  // Sorting
  filtered.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    // Handle strings, dates, and numbers
    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = (valB || '').toLowerCase();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginated = filtered.slice(offset, offset + limit);

  res.json({
    data: paginated,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  });
});

// API: Get aggregated stats (KPIs and chart data based on current filters)
app.get('/api/stats', (req, res) => {
  const search = (req.query.search as string) || '';
  const sheikh = (req.query.sheikh as string) || 'all';
  const platform = (req.query.platform as string) || 'all';
  const contentType = (req.query.contentType as string) || 'all';

  const filtered = getFilteredData({ search, sheikh, platform, contentType });

  // Aggregations
  let totalInteractions = 0;
  const sheikhsAgg: { [key: string]: { count: number; interactions: number } } = {};
  const platformsAgg: { [key: string]: { count: number; interactions: number } } = {};
  const contentTypesAgg: { [key: string]: { count: number; interactions: number } } = {};
  const timelineAgg: { [key: string]: { count: number; interactions: number } } = {};

  filtered.forEach(item => {
    totalInteractions += item.interactions;

    // Sheikh
    if (item.sheikh) {
      if (!sheikhsAgg[item.sheikh]) sheikhsAgg[item.sheikh] = { count: 0, interactions: 0 };
      sheikhsAgg[item.sheikh].count += 1;
      sheikhsAgg[item.sheikh].interactions += item.interactions;
    }

    // Platform
    if (item.platform) {
      if (!platformsAgg[item.platform]) platformsAgg[item.platform] = { count: 0, interactions: 0 };
      platformsAgg[item.platform].count += 1;
      platformsAgg[item.platform].interactions += item.interactions;
    }

    // Content Type
    if (item.contentType) {
      if (!contentTypesAgg[item.contentType]) contentTypesAgg[item.contentType] = { count: 0, interactions: 0 };
      contentTypesAgg[item.contentType].count += 1;
      contentTypesAgg[item.contentType].interactions += item.interactions;
    }

    // Year/Date
    let year = 'غير محدد';
    if (item.uploadDate) {
      const match = item.uploadDate.match(/^(\d{4})/);
      if (match) year = match[1];
    }
    if (!timelineAgg[year]) timelineAgg[year] = { count: 0, interactions: 0 };
    timelineAgg[year].count += 1;
    timelineAgg[year].interactions += item.interactions;
  });

  // Transform for charts
  const topSheikhs = Object.entries(sheikhsAgg)
    .map(([name, data]) => ({ name, count: data.count, interactions: data.interactions }))
    .sort((a, b) => b.interactions - a.interactions)
    .slice(0, 10); // top 10 sheikhs by interactions

  const platformsData = Object.entries(platformsAgg)
    .map(([name, data]) => ({ name, count: data.count, interactions: data.interactions }))
    .sort((a, b) => b.interactions - a.interactions);

  const contentTypesData = Object.entries(contentTypesAgg)
    .map(([name, data]) => ({ name, count: data.count, interactions: data.interactions }))
    .sort((a, b) => b.interactions - a.interactions);

  const timelineData = Object.entries(timelineAgg)
    .map(([year, data]) => ({ year, count: data.count, interactions: data.interactions }))
    .sort((a, b) => a.year.localeCompare(b.year));

  res.json({
    kpis: {
      totalMaterials: filtered.length,
      totalInteractions,
      avgInteractions: filtered.length > 0 ? Math.round(totalInteractions / filtered.length) : 0,
      uniqueSheikhsCount: Object.keys(sheikhsAgg).length,
      uniquePlatformsCount: Object.keys(platformsAgg).length
    },
    topSheikhs,
    platforms: platformsData,
    contentTypes: contentTypesData,
    timeline: timelineData
  });
});

// API: AI Insights and Advisor with Gemini
app.post('/api/gemini/analyze', async (req, res) => {
  const { message, statsSummary } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "مفتاح API الخاص بـ Gemini غير متوفر. يرجى تهيئته في لوحة الإعدادات." });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const systemPrompt = `أنت مستشار ذكي وخبير في تحليل البيانات الدعوية والتقارير الرقمية للأنشطة والدروس والمحاضرات الدينية عبر المنصات الاجتماعية.
لديك البيانات والمؤشرات الملخصة التالية للتقرير الحالي:
- إجمالي المواد المعروضة: ${statsSummary.totalMaterials} مادة دعوية.
- إجمالي التفاعلات: ${statsSummary.totalInteractions} تفاعل.
- معدل التفاعل لكل مادة: ${statsSummary.avgInteractions} تفاعل.
- عدد المشايخ في التقرير: ${statsSummary.uniqueSheikhsCount} شيخ.
- عدد المنصات: ${statsSummary.uniquePlatformsCount} منصة.

أهم المشايخ تفاعلاً:
${statsSummary.topSheikhs ? statsSummary.topSheikhs.map((s: any) => `- الشيخ: ${s.name} (${s.count} مقطع، إجمالي تفاعل: ${s.interactions})`).join('\n') : ''}

المنصات المستخدمة:
${statsSummary.platforms ? statsSummary.platforms.map((p: any) => `- منصة ${p.name}: ${p.count} مقطع، إجمالي تفاعل: ${p.interactions}`).join('\n') : ''}

توزيع أنواع المحتوى:
${statsSummary.contentTypes ? statsSummary.contentTypes.map((c: any) => `- نوع ${c.name}: ${c.count} مقطع، إجمالي تفاعل: ${c.interactions}`).join('\n') : ''}

الرجاء الرد على أسئلة المستخدم باللغة العربية بأسلوب احترافي وتحليلي، وتقديم نصائح وتوجيهات دعوية تسويقية رقمية مبنية على هذه البيانات لرفع مستوى التفاعل والانتشار، مع استخدام نقاط واضحة وتنسيق Markdown جميل.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message || "قدم لي تحليلاً شاملاً للمؤشرات الحالية وتوصيات لتحسين الأداء.",
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    res.json({ answer: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي." });
  }
});

// Vite server configuration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
