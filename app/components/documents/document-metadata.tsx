import Calendar from "lucide-react/dist/esm/icons/calendar";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Tag from "lucide-react/dist/esm/icons/tag";
import Link2 from "lucide-react/dist/esm/icons/link-2";
import Shield from "lucide-react/dist/esm/icons/shield";
import Clock from "lucide-react/dist/esm/icons/clock";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { formatDate, formatFileSize } from "~/utils/format";

interface DocumentMetadata {
  id: string;
  name: string;
  originalFilename: string;
  fileType: string;
  fileSize: number;
  category: string;
  description?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  status: string;
  uploadedAt: string;
  tags: string[];
  verifiedAt?: string;
  expiresAt?: string;
}

interface DocumentMetadataProps {
  document: DocumentMetadata;
  showActions?: boolean;
  onEdit?: (document: DocumentMetadata) => void;
  onDelete?: (documentId: string) => void;
}

const STATUS_STYLES = {
  verified: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
};

const CATEGORY_ICONS = {
  "estate-planning": "📄",
  insurance: "🛡️",
  financial: "💰",
  property: "🏠",
  legal: "⚖️",
  healthcare: "🏥",
  tax: "📊",
  other: "📎",
};

export function DocumentMetadataComponent({
  document,
  showActions = false,
  onEdit,
  onDelete,
}: DocumentMetadataProps) {
  const categoryIcon = CATEGORY_ICONS[document.category as keyof typeof CATEGORY_ICONS] || "📎";
  const statusStyle =
    STATUS_STYLES[document.status as keyof typeof STATUS_STYLES] || STATUS_STYLES.draft;

  return (
    <Card className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{categoryIcon}</div>
          <div>
            <h2 className="text-xl font-semibold">{document.name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{document.originalFilename}</p>
          </div>
        </div>
        <Badge className={statusStyle}>{document.status}</Badge>
      </div>

      {/* Description */}
      {document.description && (
        <div>
          <h3 className="mb-2 text-sm font-medium">Description</h3>
          <p className="text-gray-600 dark:text-gray-400">{document.description}</p>
        </div>
      )}

      {/* File Information */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-sm font-medium">File Details</h3>

          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">Type:</span>
            <span className="font-medium">{document.fileType.toUpperCase()}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">Size:</span>
            <span className="font-medium">{formatFileSize(document.fileSize)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">Uploaded:</span>
            <span className="font-medium">{formatDate(document.uploadedAt)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium">Organization</h3>

          <div className="flex items-center gap-2 text-sm">
            <Tag className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">Category:</span>
            <span className="font-medium capitalize">{document.category.replace(/-/g, " ")}</span>
          </div>

          {document.relatedEntityType && (
            <div className="flex items-center gap-2 text-sm">
              <Link2 className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">Related to:</span>
              <span className="font-medium capitalize">
                {document.relatedEntityType.replace(/-/g, " ")}
              </span>
            </div>
          )}

          {document.verifiedAt && (
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-gray-600 dark:text-gray-400">Verified:</span>
              <span className="font-medium">{formatDate(document.verifiedAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      {document.tags.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {document.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Expiration Warning */}
      {document.expiresAt && (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-700 dark:bg-yellow-900/20">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
              Document expires on {formatDate(document.expiresAt)}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2 border-t pt-4">
          {onEdit && (
            <button
              onClick={() => onEdit(document)}
              className="rounded-md px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
            >
              Edit Metadata
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(document.id)}
              className="rounded-md px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
            >
              Delete Document
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
