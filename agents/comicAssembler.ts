import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface ComicPanel {
  narration: string;
  imageUrl: string;
  userInput: string;
}

export class ComicAssembler {
  async createComic(panels: ComicPanel[]): Promise<string> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Cover page
    await this.addCoverPage(pdfDoc, font);

    // Add each panel
    for (let i = 0; i < panels.length; i++) {
      await this.addPanelPage(pdfDoc, panels[i], i + 1, font, normalFont);
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join(process.cwd(), 'output', `comic-${Date.now()}.pdf`);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, pdfBytes);

    return outputPath;
  }

  private async addCoverPage(pdfDoc: PDFDocument, font: any) {
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();

    page.drawText('MY AMAZING COMIC', {
      x: 50,
      y: height - 100,
      size: 40,
      font: font,
      color: rgb(0.2, 0.4, 0.8),
    });

    page.drawText('Created by a Young Storyteller', {
      x: 50,
      y: height - 150,
      size: 16,
      font: font,
      color: rgb(0.4, 0.4, 0.4),
    });
  }

  private async addPanelPage(
    pdfDoc: PDFDocument,
    panel: ComicPanel,
    panelNumber: number,
    font: any,
    normalFont: any
  ) {
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();

    // Panel number
    page.drawText(`Panel ${panelNumber}`, {
      x: 50,
      y: height - 50,
      size: 20,
      font: font,
      color: rgb(0.2, 0.4, 0.8),
    });

    // Download and embed image
    try {
      const imageBytes = await this.downloadImage(panel.imageUrl);
      const image = await pdfDoc.embedPng(imageBytes);

      const imageWidth = 500;
      const imageHeight = 400;

      page.drawImage(image, {
        x: 50,
        y: height - 500,
        width: imageWidth,
        height: imageHeight,
      });
    } catch (error) {
      console.error("Failed to embed image:", error);
      // Draw placeholder rectangle
      page.drawRectangle({
        x: 50,
        y: height - 500,
        width: 500,
        height: 400,
        color: rgb(0.9, 0.9, 0.9),
      });
    }

    // Narration
    const narration = this.wrapText(panel.narration, 70);
    let yPosition = height - 550;

    narration.forEach(line => {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 14,
        font: normalFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;
    });
  }

  private async downloadImage(url: string): Promise<Uint8Array> {
    if (url.startsWith('data:')) {
      const base64Data = url.split(',')[1];
      return new Uint8Array(Buffer.from(base64Data, 'base64'));
    }
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return new Uint8Array(response.data);
  }

  private wrapText(text: string, maxChars: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      if ((currentLine + word).length > maxChars) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    });

    if (currentLine.trim().length > 0) {
      lines.push(currentLine.trim());
    }

    return lines;
  }
}