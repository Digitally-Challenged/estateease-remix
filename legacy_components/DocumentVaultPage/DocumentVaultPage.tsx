import React, { useState, useContext, useMemo } from 'react';

import { Plus, FileText, PieChart } from 'lucide-react';

import { DocumentContext } from '../../contexts/DocumentContext';
import { useUnifiedAssets } from '../../contexts/UnifiedAssetContext';
import { DocumentType, UploadedDocument } from '../../types';
import Button from '../common/Button';
import Card from '../common/Card';
import LoadingState from '../common/LoadingState';
import SkeletonLoader from '../common/SkeletonLoader';
import Spinner from '../common/Spinner';

import DocumentList from './DocumentList';
import DocumentParsingModal from './DocumentParsingModal';
import DocumentUploadModal from './DocumentUploadModal';

const DocumentVaultPage: React.FC = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isParsingModalOpen, setIsParsingModalOpen] = useState(false);
  const [currentDocumentIdForParsing, setCurrentDocumentIdForParsing] = useState<string | null>(
    null,
  );
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedAsset, setSelectedAsset] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const docContext = useContext(DocumentContext);
  const unifiedAssets = useUnifiedAssets();

  if (!docContext) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Error: Context not found. Make sure providers are set up correctly.</p>
      </div>
    );
  }

  const { documents, loading } = docContext;
  const { assets } = unifiedAssets;

  // Get unique document types
  const documentTypes = useMemo(() => {
    const types = new Set<string>();
    documents.forEach(doc => types.add(doc.userDefinedType));
    return Array.from(types).sort();
  }, [documents]);

  // Get assets that have documents
  const assetsWithDocuments = useMemo(() => {
    return assets.filter(asset => asset.documentIds && asset.documentIds.length > 0);
  }, [assets]);

  // Filter documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(doc => doc.userDefinedType === selectedType);
    }

    // Filter by asset
    if (selectedAsset !== 'all') {
      const asset = assets.find(a => a.id === selectedAsset);
      if (asset?.documentIds) {
        filtered = filtered.filter(doc => asset.documentIds?.includes(doc.id));
      }
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        doc =>
          doc.fileName.toLowerCase().includes(term) ||
          doc.userDefinedType.toLowerCase().includes(term) ||
          doc.parsedSummary?.toLowerCase().includes(term),
      );
    }

    return filtered;
  }, [documents, selectedType, selectedAsset, searchTerm, assets]);

  const handleOpenParsingModal = (documentId: string) => {
    setCurrentDocumentIdForParsing(documentId);
    setIsParsingModalOpen(true);
  };

  const handleCloseParsingModal = () => {
    setIsParsingModalOpen(false);
    setCurrentDocumentIdForParsing(null);
  };

  const clearFilters = () => {
    setSelectedType('all');
    setSelectedAsset('all');
    setSearchTerm('');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Page Header - Fixed position */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">
              Document Vault
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              {filteredDocuments.length} of {documents.length} documents
            </p>
          </div>
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            leftIcon={<Plus className="w-5 h-5" />}
          >
            Upload Documents
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 mb-6">
        <Card className="p-6">
          <div className="space-y-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Search Documents
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by filename, type, or content..."
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT dark:bg-neutral-700 dark:text-neutral-100"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Filter by Type */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Filter by Document Type
                </label>
                <select
                  value={selectedType}
                  onChange={e => setSelectedType(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT dark:bg-neutral-700 dark:text-neutral-100"
                >
                  <option value="all">All Types</option>
                  {documentTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Asset */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  Filter by Related Asset
                </label>
                <select
                  value={selectedAsset}
                  onChange={e => setSelectedAsset(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT dark:bg-neutral-700 dark:text-neutral-100"
                >
                  <option value="all">All Documents</option>
                  {assetsWithDocuments.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.documentIds?.length} docs)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {(selectedType !== 'all' || selectedAsset !== 'all' || searchTerm) && (
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Document List - Takes remaining space */}
      <div className="flex-1 min-h-0 flex flex-col">
        <LoadingState
          isLoading={loading}
          variant="skeleton"
          skeletonType="table"
          message="Loading documents..."
        >
          <div className="flex-1">
            <DocumentList
              documents={filteredDocuments}
              onStartParse={handleOpenParsingModal}
              assets={assets}
            />
          </div>
        </LoadingState>

        {/* Informational card about AI - Fixed at bottom */}
        <div className="flex-shrink-0 mt-6">
          <Card
            title="AI Document Analysis & Asset Linking"
            className="border-l-4 border-secondary-DEFAULT"
          >
            <p className="text-neutral-600 dark:text-neutral-300 text-sm">
              Documents can now be linked to assets for better organization and tracking.
            </p>
            <ul className="list-disc list-inside mt-2 text-sm text-neutral-600 dark:text-neutral-300 space-y-1">
              <li>When adding or editing an asset, you can attach relevant documents</li>
              <li>Use the filters above to view documents by type or related asset</li>
              <li>Click "Analyze" to get an AI-generated summary of any document</li>
              <li>Linked documents appear in the asset details view</li>
            </ul>
          </Card>
        </div>
      </div>

      <DocumentUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />

      <DocumentParsingModal
        isOpen={isParsingModalOpen}
        onClose={handleCloseParsingModal}
        documentId={currentDocumentIdForParsing}
      />
    </div>
  );
};

export default DocumentVaultPage;
