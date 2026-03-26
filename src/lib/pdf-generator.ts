/**
 * HTML → PDF conversion using Puppeteer + @sparticuz/chromium.
 *
 * Works both locally (if Chrome/Chromium is installed) and on Vercel serverless
 * via the @sparticuz/chromium package which bundles a compatible Chromium binary.
 */

import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// Vercel serverless: disable GPU/graphics stack (not available in Lambda)
chromium.setGraphicsMode = false;

const DEFAULT_VIEWPORT = { width: 1280, height: 720 };

const PDF_OPTIONS = {
  format: 'A4' as const,
  printBackground: true,
  margin: {
    top: '25mm',
    right: '20mm',
    bottom: '30mm',
    left: '20mm',
  },
};

/** Resolve the Chromium executable path for the current environment. */
async function getExecutablePath(): Promise<string> {
  // On Vercel serverless, extract to /tmp (the only writable directory)
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return await chromium.executablePath('/tmp/chromium');
  }
  return (
    process.env.CHROME_EXECUTABLE_PATH ||
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  );
}

/**
 * Render a single HTML string to a PDF buffer (A4, print-ready).
 * Launches and closes its own Chromium instance — prefer `htmlToPdfBatch`
 * when converting multiple documents.
 */
export async function htmlToPdf(html: string): Promise<Buffer> {
  const executablePath = await getExecutablePath();

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: DEFAULT_VIEWPORT,
    executablePath,
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf(PDF_OPTIONS);
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

/**
 * Render multiple HTML documents to PDF buffers using a SINGLE Chromium
 * instance. Each document gets its own page (opened then closed) to keep
 * memory bounded while avoiding the cost of launching Chromium per file.
 */
export async function htmlToPdfBatch(htmlDocs: string[]): Promise<Buffer[]> {
  if (htmlDocs.length === 0) return [];
  if (htmlDocs.length === 1) return [await htmlToPdf(htmlDocs[0])];

  const executablePath = await getExecutablePath();

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: DEFAULT_VIEWPORT,
    executablePath,
    headless: true,
  });

  try {
    const results: Buffer[] = [];
    for (const html of htmlDocs) {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf(PDF_OPTIONS);
      results.push(Buffer.from(pdf));
      await page.close(); // free page memory
    }
    return results;
  } finally {
    await browser.close();
  }
}
