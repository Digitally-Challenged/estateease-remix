import React, { useState, useContext } from 'react';

import { Trash, Pencil, FileText, Sparkles, PieChart } from 'lucide-react';

import { DOCUMENT_TYPE_OPTIONS } from '../../constants/asset-options';
import { DocumentContext } from '../../contexts/DocumentContext';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Select from '../common/Select';

import type { UploadedDocument, DocumentType, Asset } from '../../types';

interface DocumentListItemProps {
  document: UploadedDocument;
  onStartParse: (documentId: string) => void;
  assets?: Asset[];
}

const DocumentListItem: React.FC<DocumentListItemProps> = ({ document, onStartParse, assets }) => {
  const docContext = useContext(DocumentContext);
  const [isEditingType, setIsEditingType] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType | string>(document.userDefinedType);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!docContext) {
    throw new Error('DocumentContext cannot be used outside a DocumentProvider');
  }

  const handleDelete = () => {
    docContext.deleteDocument(document.id);
    setShowDeleteConfirm(false);
  };

  const handleUpdateType = () => {
    if (selectedType !== document.userDefinedType) {
      docContext.updateDocumentType(document.id, selectedType);
    }
    setIsEditingType(false);
  };

  const fileSizeKB = (document.fileSize / 1024).toFixed(1);
  const uploadDate = new Date(document.uploadDate).toLocaleDateString();

  // Find linked assets
  const linkedAssets = assets?.filter(asset => asset.documentIds?.includes(document.id)) || [];

  const getFileIcon = () => {
    if (document.originalFileType.startsWith('image/')) {
      return <FileText className="w-6 h-6 text-purple-500" />;
    }
    if (document.originalFileType === 'application/pdf') {
      return <FileText className="w-6 h-6 text-red-500" />;
    }
    if (
      document.originalFileType.includes('spreadsheet') ||
      document.originalFileType.includes('excel')
    ) {
      return <FileText className="w-6 h-6 text-green-500" />;
    }
    if (
      document.originalFileType.includes('word') ||
      document.originalFileType.includes('document')
    ) {
      return <FileText className="w-6 h-6 text-blue-500" />;
    }
    return <FileText className="w-6 h-6 text-neutral-500" />;
  };

  const getParsingStatusBadge = () => {
    const status = document.parsingStatus || 'none'; // Default to 'none' if undefined
    switch (status) {
      case 'none':
        return (
          <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-600 dark:bg-neutral-600 dark:text-neutral-200">
            Not Analyzed
          </span>
        );
      case 'pending':
      case 'processing':
        return (
          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-200 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100">
            Analyzing...
          </span>
        );
      case 'completed':
        return (
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-200 text-green-700 dark:bg-green-700 dark:text-green-100">
            Analyzed
          </span>
        );
      case 'failed':
        return (
          <span
            className="text-xs px-2 py-0.5 rounded-full bg-red-200 text-red-700 dark:bg-red-700 dark:text-red-100"
            title={document.parseError}
          >
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <tr className="group border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors duration-150">
      <td className="px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-200 whitespace-nowrap">
        {getFileIcon()}
      </td>
      <td className="px-4 py-2.5 text-sm text-neutral-800 dark:text-neutral-100 font-medium whitespace-nowrap">
        <span title={document.fileName} className="truncate block max-w-xs">
          {document.fileName}
        </span>
      </td>
      <td className="px-4 py-2.5 text-sm text-neutral-600 dark:text-neutral-300 whitespace-nowrap">
        {isEditingType ? (
          <div className="flex items-center space-x-2 min-w-[200px]">
            <Select
              name="userDefinedType"
              value={selectedType}
              onChange={e => setSelectedType(e.target.value as DocumentType)}
              options={DOCUMENT_TYPE_OPTIONS}
              className="py-1 text-xs"
              wrapperClassName="mb-0 grow"
            />
            <Button size="sm" onClick={handleUpdateType} className="px-2 py-1 text-xs">
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditingType(false)}
              className="px-2 py-1 text-xs"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center">
            <span>{document.userDefinedType}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingType(true)}
              className="ml-2 p-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150"
              aria-label="Edit document type"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </td>
      <td className="px-4 py-2.5 text-sm text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
        {fileSizeKB} KB
      </td>
      <td className="px-4 py-2.5 text-sm text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
        {uploadDate}
      </td>
      <td className="px-4 py-2.5 text-sm text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
        {getParsingStatusBadge()}
      </td>
      <td className="px-4 py-2.5 text-sm text-neutral-500 dark:text-neutral-400">
        {linkedAssets.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {linkedAssets.slice(0, 2).map(asset => (
              <span
                key={asset.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-primary-light/10 text-primary-DEFAULT dark:bg-primary-DEFAULT/20 dark:text-primary-light rounded-md"
                title={`Linked to ${asset.name}`}
              >
                <PieChart className="w-3 h-3" />
                {asset.name}
              </span>
            ))}
            {linkedAssets.length > 2 && (
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                +{linkedAssets.length - 2} more
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-neutral-400 dark:text-neutral-500">—</span>
        )}
      </td>
      <td className="px-4 py-2.5 text-sm text-neutral-500 dark:text-neutral-400 whitespace-nowrap text-right space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onStartParse(document.id)}
          leftIcon={<Sparkles className="w-4 h-4" />}
          aria-label={`Analyze ${document.fileName} with AI`}
          disabled={document.parsingStatus === 'processing' || document.parsingStatus === 'pending'}
          className="opacity-50 group-hover:opacity-100 hover:!opacity-100 focus:!opacity-100 group-hover:bg-neutral-100 dark:group-hover:bg-neutral-700 transition-all duration-150"
        >
          {document.parsingStatus === 'completed' ? 'Re-Analyze' : 'Analyze'}
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setShowDeleteConfirm(true)}
          aria-label={`Delete ${document.fileName}`}
          className="opacity-50 group-hover:opacity-100 hover:!opacity-100 focus:!opacity-100 group-hover:bg-red-500/10 dark:group-hover:bg-red-500/20 transition-all duration-150"
        >
          <Trash className="w-4 h-4" />
        </Button>
      </td>
      {showDeleteConfirm && (
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Confirm Deletion"
          footer={(
            <>
              <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete Document
              </Button>
            </>
          )}
        >
          <p className="text-neutral-700 dark:text-neutral-200">
            Are you sure you want to delete the document "{document.fileName}"? This action cannot
            be undone.
          </p>
        </Modal>
      )}
    </tr>
  );
};

export default DocumentListItem;
