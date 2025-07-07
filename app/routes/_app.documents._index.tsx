import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { FileText, Upload, Folder, Search, FileCheck, FileX, Filter } from "lucide-react";
import { Input } from "~/components/ui/forms/input";

// Mock data for now - will be replaced with database integration
interface Document {
  id: string;
  name: string;
  category: string;
  type: string;
  uploadedDate: string;
  lastModified: string;
  size: string;
  status: 'verified' | 'pending' | 'expired';
  relatedEntity?: {
    type: 'trust' | 'asset' | 'insurance' | 'tax';
    name: string;
    id: string;
  };
}

export async function loader() {
  // Mock documents for now - in production, this would query from database
  const documents: Document[] = [
    {
      id: '1',
      name: 'Coleman Family Trust Agreement',
      category: 'Trust Documents',
      type: 'PDF',
      uploadedDate: '2024-01-15',
      lastModified: '2024-01-15',
      size: '2.4 MB',
      status: 'verified',
      relatedEntity: {
        type: 'trust',
        name: 'Coleman Family Trust',
        id: 'trust-1'
      }
    },
    {
      id: '2',
      name: 'Portland Property Deed',
      category: 'Real Estate',
      type: 'PDF',
      uploadedDate: '2023-11-20',
      lastModified: '2023-11-20',
      size: '1.8 MB',
      status: 'verified',
      relatedEntity: {
        type: 'asset',
        name: 'Portland Primary Residence',
        id: 'asset-1'
      }
    },
    {
      id: '3',
      name: 'Life Insurance Policy - Nicholas',
      category: 'Insurance',
      type: 'PDF',
      uploadedDate: '2024-02-01',
      lastModified: '2024-02-01',
      size: '892 KB',
      status: 'pending',
      relatedEntity: {
        type: 'insurance',
        name: 'Northwestern Mutual Policy',
        id: 'insurance-1'
      }
    },
    {
      id: '4',
      name: '2023 Tax Return',
      category: 'Tax Documents',
      type: 'PDF',
      uploadedDate: '2024-04-10',
      lastModified: '2024-04-10',
      size: '3.1 MB',
      status: 'verified',
      relatedEntity: {
        type: 'tax',
        name: '2023 Tax Year',
        id: 'tax-2023'
      }
    }
  ];

  // Group documents by category
  const documentsByCategory = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  const stats = {
    totalDocuments: documents.length,
    verifiedDocuments: documents.filter(d => d.status === 'verified').length,
    pendingDocuments: documents.filter(d => d.status === 'pending').length,
    categories: Object.keys(documentsByCategory).length
  };

  return json({ documents, documentsByCategory, stats });
}

export default function DocumentsOverview() {
  const { documents, documentsByCategory, stats } = useLoaderData<typeof loader>();

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'verified':
        return <FileCheck className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <FileText className="h-4 w-4 text-yellow-600" />;
      case 'expired':
        return <FileX className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: Document['status']) => {
    const styles = {
      verified: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const summaryCards = [
    {
      title: "Total Documents",
      value: stats.totalDocuments.toString(),
      icon: FileText,
      description: "All uploaded documents"
    },
    {
      title: "Verified",
      value: stats.verifiedDocuments.toString(),
      icon: FileCheck,
      description: "Reviewed and confirmed"
    },
    {
      title: "Pending Review",
      value: stats.pendingDocuments.toString(),
      icon: FileText,
      description: "Awaiting verification"
    },
    {
      title: "Categories",
      value: stats.categories.toString(),
      icon: Folder,
      description: "Document types"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Library</h1>
          <p className="text-gray-600">Securely store and organize your estate planning documents</p>
        </div>
        <Link to="/documents/upload">
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </Link>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search documents..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                <p className="text-xs text-gray-600">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Documents by Category */}
      {Object.entries(documentsByCategory).map(([category, categoryDocs]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category}</CardTitle>
            <CardDescription>
              {categoryDocs.length} {categoryDocs.length === 1 ? 'document' : 'documents'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryDocs.map((doc) => (
                <div 
                  key={doc.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(doc.status)}
                    <div>
                      <h4 className="font-medium text-gray-900">{doc.name}</h4>
                      <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600">
                        <span>{doc.type} • {doc.size}</span>
                        <span>Uploaded {new Date(doc.uploadedDate).toLocaleDateString()}</span>
                        {doc.relatedEntity && (
                          <span className="text-blue-600">
                            Linked to {doc.relatedEntity.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(doc.status)}
                    <div className="flex space-x-2">
                      <Link
                        to={`/documents/${doc.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View
                      </Link>
                      <button className="text-sm text-blue-600 hover:text-blue-800">
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Empty State */}
      {documents.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded yet</h3>
            <p className="text-gray-500 mb-4">Start building your secure document library</p>
            <Link to="/documents/upload">
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First Document
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}