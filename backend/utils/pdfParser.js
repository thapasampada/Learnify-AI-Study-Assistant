import fs from "fs/promises"
import { PDFParse } from "pdf-parse"

/**
 * Extracts text from a PDF file.
 * @param {string} filePath - The path to the PDF file.
 * @returns {Promise<{text: string, numPages: number}>} - The extracted text and page count from the PDF.
 */
export const extractTextFromPDF = async (filePath) => {
    try{
        const dataBuffer = await fs.readFile(filePath)
        // pdf-parse expects Uint8Array, not a Buffer
        const parser = new PDFParse(new Uint8Array(dataBuffer))
        const data = await parser.getText()

        return { text: data.text, numPages: data.numpages, info: data.info, }

    }catch (error) {
        console.error("PDF parsing error:", error)
        throw new Error("Failed to extract text from PDF.")
    }
}