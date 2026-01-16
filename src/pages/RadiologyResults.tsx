import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, Save, CheckCircle, FileText, Upload, ZoomIn, ZoomOut, 
  Maximize2, RotateCw, Move, Ruler, Eye, Grid3x3, Star, Image as ImageIcon,
  Play, Pause
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

const mockPatient = {
  name: "Kavya Iyer",
  mrn: "MRN-217564",
  age: 28,
  sex: "F",
  indication: "r/o PE",
  relevantLabs: "Creatinine: 0.8 mg/dL (Normal)",
  allergies: ["None"]
};

const mockOrder = {
  id: "OR-RD-55421",
  modality: "CT",
  bodyPart: "Chest",
  laterality: "N/A",
  contrast: "With IV contrast",
  room: "CT-2",
  scheduled: "Today 09:45 AM",
  technologist: "Tech. Patel",
  radiologist: "Dr. Kumar",
  priority: "STAT",
  status: "Images Available"
};

const mockSeries = [
  {
    id: "1",
    description: "Scout",
    images: 1,
    date: "Today 09:50 AM",
    thumbnail: "🔍"
  },
  {
    id: "2",
    description: "Chest PE Protocol - Arterial Phase",
    images: 256,
    date: "Today 09:52 AM",
    thumbnail: "🫁"
  },
  {
    id: "3",
    description: "Lung Window",
    images: 256,
    date: "Today 09:52 AM",
    thumbnail: "🫁"
  },
  {
    id: "4",
    description: "Mediastinal Window",
    images: 256,
    date: "Today 09:52 AM",
    thumbnail: "❤️"
  },
  {
    id: "5",
    description: "MPR Coronal",
    images: 180,
    date: "Today 09:53 AM",
    thumbnail: "📊"
  }
];

const mockAttachments = [
  {
    id: "1",
    type: "image",
    name: "Key Finding 1.jpg",
    date: "Today 10:15 AM"
  },
  {
    id: "2",
    type: "pdf",
    name: "Previous Report.pdf",
    date: "1 month ago"
  }
];

const reportTemplates = [
  "CT Chest - PE Protocol",
  "Chest X-ray - Routine",
  "MRI Brain - Stroke Protocol",
  "Abdomen CT - Trauma"
];

export default function RadiologyResults() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [findings, setFindings] = useState("");
  const [impression, setImpression] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [viewerLayout, setViewerLayout] = useState("1x1");
  const [activeTab, setActiveTab] = useState("study");

  const handleLoadTemplate = () => {
    if (selectedTemplate) {
      setFindings("Template loaded: " + selectedTemplate + "\n\nFindings section will be populated here...");
      setImpression("No acute findings.");
      toast({
        title: "Template Loaded",
        description: `${selectedTemplate} template has been applied.`,
      });
    }
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft Saved",
      description: "Radiology report has been saved as draft.",
    });
  };

  const handleRelease = () => {
    toast({
      title: "Report Released",
      description: "Radiology report has been released and is now final.",
    });
    setTimeout(() => navigate("/diagnostics"), 1500);
  };

  const { isCollapsed } = useSidebarContext();

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      
      <div className={cn("flex-1 transition-all duration-300", isCollapsed ? "ml-[60px]" : "ml-[220px]")}>
        <AppHeader breadcrumbs={["Diagnostics", "Radiology Results"]} />
        
        <main className="px-6 py-6 pb-24 overflow-y-auto" style={{ maxHeight: "calc(100vh - 64px)" }}>
          {/* Back Link */}
          <button
            onClick={() => navigate("/diagnostics")}
            className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Diagnostics</span>
          </button>

          {/* Patient Card */}
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground">Patient</div>
                  <div className="font-medium text-lg">{mockPatient.name}</div>
                  <div className="text-sm text-muted-foreground">{mockPatient.mrn} • {mockPatient.age}y | {mockPatient.sex}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Indication</div>
                  <div className="font-medium">{mockPatient.indication}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Relevant Labs</div>
                  <div className="text-sm">{mockPatient.relevantLabs}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Allergies</div>
                  <Badge variant="outline" className="mt-1">{mockPatient.allergies[0]}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Card */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-6 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Order ID</div>
                  <div className="font-medium">{mockOrder.id}</div>
                  <Badge variant="destructive" className="mt-1">{mockOrder.priority}</Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Study</div>
                  <div className="text-sm font-medium">{mockOrder.modality} {mockOrder.bodyPart}</div>
                  <div className="text-xs text-muted-foreground">{mockOrder.contrast}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Room</div>
                  <div className="text-sm">{mockOrder.room}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Scheduled</div>
                  <div className="text-xs">{mockOrder.scheduled}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Technologist</div>
                  <div className="text-sm">{mockOrder.technologist}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Radiologist</div>
                  <div className="text-sm">{mockOrder.radiologist}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-4 gap-6">
            {/* Viewer - Left Column (2.5/4) */}
            <div className="col-span-3 space-y-4">
              {/* Viewer Toolbar */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Grid3x3 className="h-4 w-4 mr-1" />
                        {viewerLayout}
                      </Button>
                      <Select value={viewerLayout} onValueChange={setViewerLayout}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1x1">1×1</SelectItem>
                          <SelectItem value="2x2">2×2</SelectItem>
                          <SelectItem value="1x2">1×2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" title="Zoom In">
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Zoom Out">
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Pan">
                        <Move className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Rotate">
                        <RotateCw className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Measure">
                        <Ruler className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Window/Level">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Fullscreen">
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* DICOM Viewer Area */}
              <Card className="h-[500px] bg-black">
                <CardContent className="h-full flex items-center justify-center p-0">
                  <div className="text-white/60 text-center">
                    <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">DICOM Viewer Area</p>
                    <p className="text-xs mt-2">Select a series from the gallery to view</p>
                    <div className="mt-4 space-y-2 text-xs">
                      <div>Study: CT Chest with contrast</div>
                      <div>Series: 256 images</div>
                      <div>Window: Lung (W:1500 L:-600)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Report Authoring */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Report</CardTitle>
                    <div className="flex gap-2">
                      <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select template..." />
                        </SelectTrigger>
                        <SelectContent>
                          {reportTemplates.map(t => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" onClick={handleLoadTemplate}>
                        Load Template
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Technique</label>
                    <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-md">
                      CT examination of the chest was performed with intravenous contrast. 
                      Thin-section images were acquired. MPR reconstructions were obtained.
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Findings</label>
                    <Textarea
                      value={findings}
                      onChange={(e) => setFindings(e.target.value)}
                      placeholder="Enter detailed findings..."
                      rows={6}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Impression</label>
                    <Textarea
                      value={impression}
                      onChange={(e) => setImpression(e.target.value)}
                      placeholder="Enter impression/conclusion..."
                      rows={3}
                      className="font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Recommendations</label>
                    <Textarea
                      value={recommendations}
                      onChange={(e) => setRecommendations(e.target.value)}
                      placeholder="Enter recommendations (optional)..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gallery & References - Right Column (1.5/4) */}
            <div className="space-y-4">
              <Card>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <CardHeader className="pb-3">
                    <TabsList className="w-full">
                      <TabsTrigger value="study" className="flex-1">Study Gallery</TabsTrigger>
                      <TabsTrigger value="attachments" className="flex-1">Attachments</TabsTrigger>
                    </TabsList>
                  </CardHeader>
                  <CardContent>
                    <TabsContent value="study" className="mt-0">
                      <ScrollArea className="h-[600px]">
                        <div className="space-y-3">
                          {mockSeries.map((series) => (
                            <Card 
                              key={series.id} 
                              className={`cursor-pointer hover:bg-accent transition-colors ${
                                selectedSeries === series.id ? "border-primary" : ""
                              }`}
                              onClick={() => setSelectedSeries(series.id)}
                            >
                              <CardContent className="p-3">
                                <div className="flex gap-3">
                                  <div className="w-16 h-16 bg-muted rounded flex items-center justify-center text-2xl">
                                    {series.thumbnail}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">
                                      {series.description}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {series.images} images
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {series.date}
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Star className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                    <TabsContent value="attachments" className="mt-0">
                      <div className="space-y-3">
                        {mockAttachments.map((attachment) => (
                          <Card key={attachment.id}>
                            <CardContent className="p-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                                  <FileText className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate">
                                    {attachment.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {attachment.date}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        <Button variant="outline" className="w-full">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload File
                        </Button>
                      </div>
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Prior Studies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-muted/30 rounded">
                      <div className="font-medium">CT Chest</div>
                      <div className="text-xs text-muted-foreground">6 months ago</div>
                      <Button variant="link" className="h-auto p-0 text-xs mt-1">
                        Compare with current
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Measurements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    No measurements yet. Use the ruler tool in the viewer to add measurements.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Footer */}
          <div className="fixed bottom-0 left-[196px] right-0 border-t bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Status: Draft • Last saved: Never
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSaveDraft}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button variant="outline">
                  Submit for Review
                </Button>
                <Button onClick={handleRelease}>
                  <FileText className="h-4 w-4 mr-2" />
                  Release Report
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
