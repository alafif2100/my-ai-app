import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const CSV_URL = "https://docs.google.com/spreadsheets/d/1eg9ppMVd9jocrpxXr2qbfGGloBXsXeGI/export?format=csv";

async function fetchData() {
  console.log("Fetching CSV data...");
  try {
    const res = await fetch(CSV_URL);
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.statusText}`);
    }
    const csvText = await res.text();
    console.log("Parsing CSV with PapaParse...");
    
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    console.log(`Parsed ${parsed.data.length} rows.`);

    // Map and clean rows
    const cleaned = parsed.data.map((row, index) => {
      // The keys might have spaces or weird characters, let's normalize or map them
      const title = row["العنوان"] || row["عنوان"] || "";
      const sheikh = row["الشيخ"] || "";
      const platform = row["المنصة"] || "";
      const contentType = row["نوع_المحتوى"] || row["نوع المحتوى"] || "";
      const duration = row["المدة"] || "";
      const uploadDate = row["تاريخ_الرفع"] || row["تاريخ الرفع"] || "";
      const interactionsStr = row["إجمالي التفاعلات"] || row["عدد التفاعلات"] || "0";
      const link = row["الرابط"] || "";

      // Convert interactions to number
      const interactions = parseInt(interactionsStr.replace(/[^\d]/g, ''), 10) || 0;

      return {
        id: index + 1,
        title: title.trim(),
        sheikh: sheikh.trim(),
        platform: platform.trim(),
        contentType: contentType.trim(),
        duration: duration.trim(),
        uploadDate: uploadDate.trim(),
        interactions,
        link: link.trim()
      };
    }).filter(item => item.title && item.sheikh); // only keep valid entries with title and sheikh

    console.log(`Cleaned and filtered to ${cleaned.length} valid entries.`);

    const outputDir = path.resolve('src/data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'dataset.json');
    fs.writeFileSync(outputPath, JSON.stringify(cleaned, null, 2), 'utf-8');
    console.log(`Successfully wrote dataset to ${outputPath}`);

  } catch (error) {
    console.error("Error during fetch/parse:", error);
  }
}

fetchData();
