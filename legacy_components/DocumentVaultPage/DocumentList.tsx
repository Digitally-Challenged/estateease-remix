import React from 'react';

import { FileText } from 'lucide-react';

import Card from '../common/Card';

import DocumentListItem from './DocumentListItem';

import type { UploadedDocument, Asset } from '../../types';

interface DocumentListProps {
  documents: UploadedDocument[];
  onStartParse: (documentId: string) => void;
  assets?: Asset[];
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, onStartParse, assets }) => {
  if (documents.length === 0) {
    return (
      <Card>
        <div className="text-center py-10">
          <FileText
            className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-500"
            aria-hidden="true"
          />
          <h3 className="mt-2 text-lg font-medium text-neutral-700 dark:text-neutral-200">
            No Documents Found
          </h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Upload your first document using the "Upload Documents" button above.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-x-auto">
      <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
        <thead className="bg-neutral-50 dark:bg-neutral-700/50">
          <tr>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider"
            >
              Icon
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider"
            >
              File Name
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider"
            >
              Document Type
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider"
            >
              Size
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider"
            >
              Uploaded
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider"
            >
              AI Status
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider"
            >
              Linked Assets
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
          {documents.map(doc => (
            <DocumentListItem
              key={doc.id}
              document={doc}
              onStartParse={onStartParse}
              assets={assets}
            />
          ))}
        </tbody>
      </table>
    </Card>
  );
};

export default DocumentList;
