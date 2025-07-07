import type { FormEvent } from 'react';
import React, { useContext, useEffect, useState } from 'react';

import { Sparkles } from 'lucide-react';

import { DocumentContext } from '../../contexts/DocumentContext';
import { ParsedKeyEntity } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';

import type { DocumentContextType } from '../../contexts/DocumentContext';
import type { UploadedDocument } from '../../types';

interface DocumentParsingModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string | null;
}

interface QAItem {
  id: string;
  question: string;
  answer: string | null;
  isLoading: boolean;
  error: string | null;
}

const DocumentParsingModal: React.FC<DocumentParsingModalProps> = ({
  isOpen,
  onClose,
  documentId,
}) => {
  const docContext = useContext(DocumentContext); // Ensure context type
  const [currentDocument, setCurrentDocument] = useState<UploadedDocument | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  // Q&A States
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [qaHistory, setQaHistory] = useState<QAItem[]>([]);
  const [isAnswering, setIsAnswering] = useState(false); // Global answering flag

  useEffect(() => {
    if (isOpen && documentId && docContext) {
      const doc = docContext.getDocumentById(documentId);
      if (doc) {
        setCurrentDocument(doc);
        setShowRawJson(false);
        setQaHistory([]); // Reset Q&A history for new document
        setCurrentQuestion('');
        if (doc.parsingStatus === 'none' || doc.parsingStatus === 'failed') {
          docContext.parseDocumentById(documentId);
        }
      } else {
        setCurrentDocument(null);
      }
    }
  }, [isOpen, documentId, docContext]);

  useEffect(() => {
    if (isOpen && documentId && docContext?.documents) {
      // Listen to documents array changes
      const doc = docContext.getDocumentById(documentId);
      if (doc) {
        setCurrentDocument(doc);
      }
    }
  }, [docContext?.documents, isOpen, documentId]);

  const handleReparse = () => {
    if (documentId && docContext) {
      setShowRawJson(false);
      setQaHistory([]); // Clear Q&A history on reparse
      docContext.parseDocumentById(documentId);
    }
  };

  const handleAskQuestion = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentQuestion.trim() || !documentId || !docContext || isAnswering) return;

    setIsAnswering(true);
    const qaEntryId = `qa-${Date.now()}`;
    const newQaEntry: QAItem = {
      id: qaEntryId,
      question: currentQuestion,
      answer: null,
      isLoading: true,
      error: null,
    };
    setQaHistory(prev => [...prev, newQaEntry]);
    setCurrentQuestion('');

    try {
      const answer = await docContext.answerQuestionAboutDocument(documentId, newQaEntry.question);
      setQaHistory(prev =>
        prev.map(item => (item.id === qaEntryId ? { ...item, answer, isLoading: false } : item)),
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get an answer.';
      setQaHistory(prev =>
        prev.map(item =>
          item.id === qaEntryId ? { ...item, error: errorMsg, isLoading: false } : item,
        ),
      );
    } finally {
      setIsAnswering(false);
    }
  };

  if (!docContext) return null;

  let modalContent;
  let modalTitle = 'Document AI Analysis';

  if (!currentDocument && isOpen) {
    modalContent = (
      <p className="text-neutral-600 dark:text-neutral-300">Loading document details...</p>
    );
  } else if (currentDocument) {
    modalTitle = `AI Analysis: ${currentDocument.fileName}`;
    switch (currentDocument.parsingStatus) {
      case 'processing':
      case 'pending':
        modalContent = (
          <div className="text-center py-4">
            <Spinner size="lg" />
            <p className="mt-3 text-neutral-600 dark:text-neutral-300">
              AI is analyzing your document. This may take a moment...
            </p>
          </div>
        );
        break;
      case 'completed':
        modalContent = (
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-primary-DEFAULT mb-1">
                AI Generated Summary:
              </h4>
              <div className="bg-secondary-DEFAULT/10 dark:bg-secondary-DEFAULT/20 p-3 rounded-md">
                <p className="text-neutral-700 dark:text-neutral-200 whitespace-pre-wrap text-sm">
                  {currentDocument.parsedSummary || 'No summary available.'}
                </p>
              </div>
            </div>
            {currentDocument.parsedKeyEntities && currentDocument.parsedKeyEntities.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-primary-DEFAULT mb-2">
                  Key Extracted Information:
                </h4>
                <div className="bg-secondary-DEFAULT/10 dark:bg-secondary-DEFAULT/20 p-3 rounded-md">
                  <ul className="space-y-2 text-sm">
                    {currentDocument.parsedKeyEntities.map((entity, index) => (
                      <li
                        key={index}
                        className="grid grid-cols-3 gap-x-2 p-2 bg-white/50 dark:bg-neutral-800/50 rounded"
                      >
                        <strong
                          className="text-neutral-600 dark:text-neutral-300 truncate col-span-1"
                          title={entity.label || entity.type}
                        >
                          {entity.label || entity.type}:
                        </strong>
                        <span
                          className="text-neutral-800 dark:text-neutral-100 col-span-2 truncate"
                          title={entity.value}
                        >
                          {entity.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {currentDocument.parsedKeyEntities &&
              currentDocument.parsedKeyEntities.length === 0 &&
              currentDocument.parsedSummary && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  No specific key entities were extracted beyond the summary.
              </p>
            )}
            {currentDocument.parsedContent && (
              <div className="mt-4">
                <Button variant="ghost" size="sm" onClick={() => setShowRawJson(!showRawJson)}>
                  {showRawJson ? 'Hide Raw JSON' : 'Show Raw JSON Response'}
                </Button>
                {showRawJson && (
                  <pre className="mt-2 p-2 bg-neutral-100 dark:bg-neutral-900 text-xs text-neutral-600 dark:text-neutral-300 rounded max-h-40 overflow-auto">
                    {currentDocument.parsedContent}
                  </pre>
                )}
              </div>
            )}

            {/* Q&A Section */}
            <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <h4 className="text-lg font-semibold text-primary-DEFAULT mb-2">
                Ask About This Document
              </h4>
              <form onSubmit={handleAskQuestion} className="flex items-start space-x-2">
                <Input
                  type="text"
                  name="question"
                  id="doc-question"
                  placeholder="Type your question here..."
                  value={currentQuestion}
                  onChange={e => setCurrentQuestion(e.target.value)}
                  disabled={isAnswering}
                  wrapperClassName="flex-grow !mb-0"
                  className="!mb-0"
                />
                <Button
                  type="submit"
                  isLoading={isAnswering}
                  disabled={isAnswering || !currentQuestion.trim()}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Ask AI
                </Button>
              </form>

              {qaHistory.length > 0 && (
                <div className="mt-4 space-y-3 max-h-60 overflow-y-auto pr-2">
                  {qaHistory.map(item => (
                    <div key={item.id} className="text-sm">
                      <p className="font-semibold text-neutral-700 dark:text-neutral-200">
                        Q: {item.question}
                      </p>
                      {item.isLoading && (
                        <div className="pl-4 py-1">
                          <Spinner size="sm" />
                        </div>
                      )}
                      {item.error && (
                        <p className="pl-4 text-red-500 dark:text-red-400">Error: {item.error}</p>
                      )}
                      {item.answer && !item.isLoading && (
                        <div className="bg-secondary-DEFAULT/10 dark:bg-secondary-DEFAULT/20 p-2 rounded-md mt-1">
                          <p className="pl-4 text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap">
                            <Sparkles className="w-3 h-3 inline mr-1 text-secondary-DEFAULT" />{' '}
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
        break;
      case 'failed':
        modalContent = (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-red-600 dark:text-red-400">
              Analysis Failed
            </h4>
            <p className="text-neutral-700 dark:text-neutral-200">
              The AI analysis could not be completed for this document.
            </p>
            {currentDocument.parseError && (
              <p className="text-sm text-neutral-600 dark:text-neutral-300 bg-red-100 dark:bg-red-900/50 p-3 rounded">
                <strong>Error:</strong> {currentDocument.parseError}
              </p>
            )}
            {currentDocument.parsedContent && (
              <div className="mt-4">
                <Button variant="ghost" size="sm" onClick={() => setShowRawJson(!showRawJson)}>
                  {showRawJson ? 'Hide Raw JSON Attempt' : 'Show Raw JSON Attempt'}
                </Button>
                {showRawJson && (
                  <pre className="mt-2 p-2 bg-neutral-100 dark:bg-neutral-900 text-xs text-neutral-600 dark:text-neutral-300 rounded max-h-40 overflow-auto">
                    {currentDocument.parsedContent}
                  </pre>
                )}
              </div>
            )}
          </div>
        );
        break;
      case 'none':
      default:
        modalContent = (
          <p className="text-neutral-600 dark:text-neutral-300">
            This document has not been analyzed by AI yet. Click "Re-analyze" to start.
          </p>
        );
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      footer={(
        <div className="flex justify-between w-full items-center">
          <Button
            variant="ghost"
            onClick={handleReparse}
            disabled={
              !currentDocument ||
              currentDocument.parsingStatus === 'processing' ||
              currentDocument.parsingStatus === 'pending'
            }
            isLoading={
              currentDocument?.parsingStatus === 'processing' ||
              currentDocument?.parsingStatus === 'pending'
            }
            leftIcon={<Sparkles className="w-5 h-5" />}
          >
            {currentDocument?.parsingStatus === 'none' ? 'Analyze Document' : 'Re-analyze'}
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      )}
    >
      {modalContent}
    </Modal>
  );
};

export default DocumentParsingModal;
