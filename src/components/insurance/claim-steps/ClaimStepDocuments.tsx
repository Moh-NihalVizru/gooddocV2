import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, File, Trash2, Download } from "lucide-react";
import { useState } from "react";

interface ClaimStepDocumentsProps {
  data: any;
  onChange: (data: any) => void;
  errors: string[];
}

export function ClaimStepDocuments({ data, onChange, errors }: ClaimStepDocumentsProps) {
  const documents = data.documents || [];
  const [selectedTag, setSelectedTag] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !selectedTag) return;

    const newDocs = Array.from(files).map(file => ({
      id: `doc${Date.now()}${Math.random()}`,
      name: file.name,
      tag: selectedTag,
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
      size: file.size
    }));

    onChange({ ...data, documents: [...documents, ...newDocs] });
    setSelectedTag("");
  };

  const removeDocument = (id: string) => {
    onChange({
      ...data,
      documents: documents.filter((doc: any) => doc.id !== id)
    });
  };

  const requiredDocs = data.claimType === "Cashless" 
    ? ["Preauth letter", "E-card"]
    : ["Bill/Invoice", "KYC"];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-6">Documents</h2>
      
      <div className="space-y-6">
        {/* Required Documents Notice */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-semibold text-sm mb-2">Required Documents for {data.claimType}</h3>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            {requiredDocs.map(doc => (
              <li key={doc}>{doc}</li>
            ))}
          </ul>
        </div>

        {/* Upload Section */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="docTag">Document Type *</Label>
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger id="docTag" className="mt-2">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bill/Invoice">Bill/Invoice</SelectItem>
                <SelectItem value="Prescription">Prescription</SelectItem>
                <SelectItem value="Lab Report">Lab Report</SelectItem>
                <SelectItem value="Imaging Report">Imaging Report</SelectItem>
                <SelectItem value="Discharge Summary">Discharge Summary</SelectItem>
                <SelectItem value="E-card">E-card</SelectItem>
                <SelectItem value="KYC">KYC</SelectItem>
                <SelectItem value="Preauth letter">Preauth letter</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop files here or click to browse
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Max file size: 10MB | Supported: PDF, JPG, PNG
            </p>
            <Label htmlFor="file-upload">
              <Button variant="outline" disabled={!selectedTag} asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </span>
              </Button>
            </Label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              disabled={!selectedTag}
            />
            {!selectedTag && (
              <p className="text-xs text-orange-600 mt-2">
                Please select a document type first
              </p>
            )}
          </div>
        </div>

        {/* Documents List */}
        {documents.length > 0 && (
          <div className="space-y-2">
            <Label>Uploaded Documents ({documents.length})</Label>
            <div className="space-y-2">
              {documents.map((doc: any) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <File className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{doc.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {doc.tag} • {new Date(doc.uploadedAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeDocument(doc.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
