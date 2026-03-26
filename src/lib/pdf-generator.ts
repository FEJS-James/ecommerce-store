/**
 * HTML → PDF conversion using Puppeteer + @sparticuz/chromium.
 *
 * Works both locally (if Chrome/Chromium is installed) and on Vercel serverless
 * via the @sparticuz/chromium package which bundles a compatible Chromium binary.
 */

import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

/**
 * Render an HTML string to a PDF buffer (A4, print-ready).
 */
export async function htmlToPdf(html: string): Promise<Buffer> {
  // @sparticuz/chromium sets this env in Vercel; locally fall back to common paths
  const executablePath = await chromium.executablePath()
    || process.env.CHROME_EXECUTABLE_PATH
    || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

  const browser = await puppeteer.launch({
    args: chromium.args,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultViewport: (chromium as any).defaultViewport ?? { width: 1280, height: 720 },
    executablePath,
    headless: true,
  });

  try {
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '25mm',
        right: '20mm',
        bottom: '30mm',
        left: '20mm',
      },
    });

    // page.pdf returns a Uint8Array in newer puppeteer; ensure we return a Buffer
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
