import { PDFParse } from 'pdf-parse';
import fs from 'fs/promises';

export const extractTextFromPDF = async (filePath) => {
    let parser;
    try {
        const dataBuffer = await fs.readFile(filePath);

        parser = new PDFParse({ data: dataBuffer });
        const result = await parser.getText();

        return {
            text: result.text,
            numPages: result.total ?? result.numpages,
            info: result.info,
        };
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error('Failed to extract text from PDF');
    } finally {
        if (parser) await parser.destroy();
    }
};