import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Brain, 
  RefreshCw,
  AlertCircle,
  Info,
  FileText,
  ClipboardCheck
} from "lucide-react";
import { LabDiagnosticsResponse, ChecklistStatus, BannerType } from "@/types/lab-diagnostics-ai";
import { cn } from "@/lib/utils";

interface DiagnosticsAIPanelProps {
  response: LabDiagnosticsResponse | null;
  isAnalyzing: boolean;
  error: string | null;
  onAnalyze: () => void;
  onApplyNarrative?: (text: string) => void;
  onApplyComments?: (text: string) => void;
}

export function DiagnosticsAIPanel({
  response,
  isAnalyzing,
  error,
  onAnalyze,
  onApplyNarrative,
  onApplyComments,
}: DiagnosticsAIPanelProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ok":
        return <CheckCircle className="h-4 w-4 text-status-success" />;
      case "attention":
        return <AlertTriangle className="h-4 w-4 text-status-warning" />;
      case "block":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getChecklistIcon = (status: ChecklistStatus) => {
    switch (status) {
      case "ok":
        return <CheckCircle className="h-4 w-4 text-status-success" />;
      case "needs_attention":
        return <AlertTriangle className="h-4 w-4 text-status-warning" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getBannerStyles = (type: BannerType) => {
    switch (type) {
      case "critical":
        return "bg-destructive/10 border-destructive/30 text-destructive";
      case "warning":
        return "bg-status-warning/10 border-status-warning/30 text-status-warning";
      case "info":
        return "bg-primary/10 border-primary/30 text-primary";
    }
  };

  const getBannerIcon = (type: BannerType) => {
    switch (type) {
      case "critical":
        return <XCircle className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "info":
        return <Info className="h-4 w-4" />;
    }
  };

  if (!response && !isAnalyzing && !error) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-5 w-5 text-muted-foreground" />
            AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            AI analysis will run automatically when test results are entered.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            {/* Animated brain with pulse rings */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '1.5s' }} />
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
              <div className="relative w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Brain className="h-8 w-8 text-primary animate-pulse" />
              </div>
            </div>
            
            {/* Analyzing text with dots animation */}
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-foreground">Analyzing</span>
              <span className="flex gap-0.5">
                <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
            
            {/* Progress steps */}
            <div className="w-full space-y-2 mt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-primary" />
                </div>
                <span>Reading test values</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <RefreshCw className="w-3 h-3 text-primary animate-spin" />
                </div>
                <span>Applying clinical rules</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground opacity-50">
                <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                </div>
                <span>Generating insights</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Analysis Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!response) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Status */}
        <div className="flex items-center gap-2">
          {getStatusIcon(response.summary.status)}
          <span className="text-sm font-medium capitalize">{response.summary.status}</span>
          {response.uiDirectives.blockRelease && (
            <Badge variant="destructive" className="ml-auto text-xs">
              Release Blocked
            </Badge>
          )}
        </div>

        {/* Page Banners */}
        {response.uiDirectives.pageBanners.length > 0 && (
          <div className="space-y-2">
            {response.uiDirectives.pageBanners.map((banner, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-start gap-2 p-2 rounded-md border text-sm",
                  getBannerStyles(banner.type)
                )}
              >
                {getBannerIcon(banner.type)}
                <span>{banner.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Critical Alerts */}
        {response.criticalAlerts.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                Critical Alerts ({response.criticalAlerts.length})
              </h4>
              <ScrollArea className="max-h-32">
                <div className="space-y-2">
                  {response.criticalAlerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className="text-sm p-2 bg-destructive/10 rounded border border-destructive/30"
                    >
                      <div className="font-medium text-destructive">{alert.testId}: {alert.value}</div>
                      <div className="text-xs text-muted-foreground">{alert.recommendedAction}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}

        {/* Validation Checklist */}
        {response.validationChecklist.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-primary" />
                Validation Checklist
              </h4>
              <div className="space-y-1">
                {response.validationChecklist.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    {getChecklistIcon(item.status)}
                    <span className={cn(
                      item.status === "needs_attention" && "text-status-warning",
                      item.status === "pending" && "text-muted-foreground"
                    )}>
                      {item.item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Reflex Suggestions */}
        {response.reflexSuggestions.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-2 text-primary">Suggested Reflex Tests</h4>
              <div className="space-y-1">
                {response.reflexSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-medium text-primary">{suggestion.testId}</span>
                    <span className="text-muted-foreground"> — {suggestion.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Narrative Draft */}
        {response.narrativeDraft && (
          <>
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Suggested Narrative
                </h4>
                {onApplyNarrative && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-primary border-primary/30 hover:bg-primary/10"
                    onClick={() => onApplyNarrative(response.narrativeDraft)}
                  >
                    Apply
                  </Button>
                )}
              </div>
              <p className="text-sm text-foreground bg-muted/50 p-3 rounded-md border border-border">
                {response.narrativeDraft}
              </p>
            </div>
          </>
        )}

        {/* Comments Draft */}
        {response.commentsDraft && (
          <>
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-primary">Suggested Comments</h4>
                {onApplyComments && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-primary border-primary/30 hover:bg-primary/10"
                    onClick={() => onApplyComments(response.commentsDraft)}
                  >
                    Apply
                  </Button>
                )}
              </div>
              <p className="text-sm text-foreground bg-muted/50 p-3 rounded-md border border-border">
                {response.commentsDraft}
              </p>
            </div>
          </>
        )}

        {/* Audit Info */}
        <Separator />
        <div className="text-xs text-muted-foreground">
          Analyzed at {new Date(response.audit.generatedAt).toLocaleTimeString()} • 
          Engine v{response.audit.engine.rulesVersion}
        </div>
      </CardContent>
    </Card>
  );
}
