import type { ChangeEvent, FormEvent } from 'react';
import React, { useState, useCallback, useContext } from 'react';

import * as ExcelJS from 'exceljs'; // Import secure Excel library
import { Plus, Trash2 } from 'lucide-react';

import { DOCUMENT_TYPE_OPTIONS } from '../../constants/asset-options';
import { DocumentContext } from '../../contexts/DocumentContext';
import { useUnifiedAssets } from '../../contexts/UnifiedAssetContext';
import { DocumentType } from '../../types';
import { logError } from '../../utils/logger';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import Select from '../common/Select';
// Input component is not directly used for file input but could be for other fields if added

import type { UploadedDocument } from '../../types';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Define Excel MIME types
const EXCEL_MIME_TYPES = [
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/wps-office.xlsx', // WPS Spreadsheet
  'application/wps-office.xls',
];
const CSV_MIME_TYPE = 'text/csv';

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({ isOpen, onClose }) => {
  const docContext = useContext(DocumentContext);
  const unifiedAssets = useUnifiedAssets();
  const [filesWithData, setFilesWithData] = useState<
    Array<{ file: File; extractedText?: string; isExcel?: boolean }>
  >([]);
  const [userDefinedType, setUserDefinedType] = useState<DocumentType | string>(
    DocumentType.MISCELLANEOUS,
  );
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [processingFiles, setProcessingFiles] = useState(false);

  if (!docContext) {
    throw new Error('DocumentContext must be used within a DocumentProvider');
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setProcessingFiles(true);
      const selectedRawFiles = Array.from(event.target.files);
      const processedFilesData: Array<{ file: File; extractedText?: string; isExcel?: boolean }> =
        [];

      for (const file of selectedRawFiles) {
        let isExcel =
          EXCEL_MIME_TYPES.includes(file.type) ||
          file.name.endsWith('.xlsx') ||
          file.name.endsWith('.xls');
        const isCsv = file.type === CSV_MIME_TYPE || file.name.endsWith('.csv');
        let extractedText: string | undefined = undefined;

        if (isExcel) {
          try {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(arrayBuffer);
            let fullText = '';

            workbook.worksheets.forEach(worksheet => {
              const sheetName = worksheet.name;
              let csvText = '';

              worksheet.eachRow((row, rowNumber) => {
                const rowValues = row.values as (string | number | boolean | null | undefined)[];
                if (rowValues && rowValues.length > 1) {
                  // Skip the first element (it's undefined for 1-based indexing)
                  const cleanValues = rowValues
                    .slice(1)
                    .map(cell => (cell !== null && cell !== undefined ? String(cell) : ''));
                  csvText += `${cleanValues.join(',')}\n`;
                }
              });

              fullText += `Sheet: ${sheetName}\n${csvText}\n`;
            });
            extractedText = fullText.trim();
          } catch (error) {
            logError('Error parsing Excel file', { fileName: file.name }, error as Error);
            // Keep isExcel true, but text will be undefined, handled during submission
          }
        } else if (isCsv) {
          try {
            extractedText = await file.text();
            isExcel = true; // Treat CSV as a type of "excel" for processing logic
          } catch (error) {
            logError('Error reading CSV file', { fileName: file.name }, error as Error);
          }
        }
        processedFilesData.push({ file, extractedText, isExcel });
      }
      setFilesWithData(prevFiles => [...prevFiles, ...processedFilesData]);
      setProcessingFiles(false);
    }
  };

  const handleRemoveFile = (fileNameToRemove: string) => {
    setFilesWithData(prevFiles => prevFiles.filter(fwd => fwd.file.name !== fileNameToRemove));
    if (filesWithData.length === 1 && filesWithData[0].file.name === fileNameToRemove) {
      setFileInputKey(Date.now());
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (filesWithData.length === 0) {
      alert('Please select at least one file to upload.');
      return;
    }
    if (!userDefinedType) {
      alert('Please select a document type.');
      return;
    }

    const newDocuments: UploadedDocument[] = filesWithData.map(
      ({ file, extractedText, isExcel }) => ({
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        fileName: file.name,
        originalFileType: file.type,
        fileSize: file.size,
        userDefinedType:
          isExcel && userDefinedType === DocumentType.MISCELLANEOUS
            ? DocumentType.SPREADSHEET
            : userDefinedType,
        uploadDate: new Date().toISOString(),
        contentPreview:
          isExcel && extractedText
            ? `Excel Content (First 100 chars): ${extractedText.substring(0, 100)}...`
            : `${file.type} - ${file.name}`,
        extractedTextContent: extractedText,
        isFromExcel: isExcel,
        parsingStatus: 'none',
      }),
    );

    docContext.addDocuments(newDocuments);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setFilesWithData([]);
    setUserDefinedType(DocumentType.MISCELLANEOUS);
    setFileInputKey(Date.now());
    setProcessingFiles(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} title="Upload New Documents">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="file-upload"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
          >
            Select Files (Multiple Allowed)
          </label>
          <input
            id="file-upload"
            key={fileInputKey}
            type="file"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-neutral-500 dark:text-neutral-400
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-md file:border-0
                       file:text-sm file:font-semibold
                       file:bg-primary-light file:text-primary-dark
                       dark:file:bg-primary-dark dark:file:text-primary-light
                       hover:file:bg-primary-DEFAULT dark:hover:file:bg-primary-DEFAULT/80
                       cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-DEFAULT dark:focus:ring-offset-neutral-800"
            aria-describedby="file-upload-help"
            disabled={processingFiles}
          />
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400" id="file-upload-help">
            Select documents (PDF, DOCX, XLSX, CSV, JPG, PNG, etc.). Excel/CSV files will be parsed.
          </p>
          {processingFiles && (
            <p className="mt-1 text-xs text-primary-DEFAULT">Processing files, please wait...</p>
          )}
        </div>

        {filesWithData.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Selected files:
            </h4>
            <ul className="max-h-40 overflow-y-auto space-y-2 rounded-md border border-neutral-300 dark:border-neutral-600 p-3 bg-neutral-50 dark:bg-neutral-700/50">
              {filesWithData.map(({ file, isExcel }) => (
                <li
                  key={file.name}
                  className="flex justify-between items-center text-sm p-1.5 rounded bg-white dark:bg-neutral-700 shadow-sm"
                >
                  <span
                    className="truncate text-neutral-700 dark:text-neutral-200"
                    title={file.name}
                  >
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    {isExcel && (
                      <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-green-200 text-green-700 dark:bg-green-700 dark:text-green-100">
                        Excel/CSV
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.name)}
                    className="ml-2 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500"
                    aria-label={`Remove ${file.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Select
          label="Assign Document Type (for all selected files)"
          name="userDefinedType"
          id="userDefinedType"
          value={userDefinedType}
          onChange={e => setUserDefinedType(e.target.value as DocumentType)}
          options={DOCUMENT_TYPE_OPTIONS}
          required
          disabled={processingFiles}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCloseModal}
            disabled={processingFiles}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            leftIcon={<Plus className="w-5 h-5" />}
            disabled={filesWithData.length === 0 || processingFiles}
          >
            {processingFiles ? 'Processing...' : 'Add to Vault'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DocumentUploadModal;
