import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { PageContent } from "@/components/PageContent";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight,
  MoreHorizontal,
  ArrowUpDown,
  RefreshCw,
  ArrowLeft
} from "lucide-react";
import { CalendarWidget } from "@/components/CalendarWidget";
import { PageKey } from "@/lib/pageSubtextConfig";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  width?: string;
  headerClassName?: string;
  cellClassName?: string;
}

export interface Filter {
  key: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
}

export interface RowAction<T> {
  label: string;
  onClick: (row: T) => void;
  hidden?: (row: T) => boolean;
  icon?: React.ReactNode;
  destructive?: boolean;
}

// URL param to filter label mapping
export interface UrlParamFilter {
  paramKey: string;
  paramValue: string;
  displayLabel: string;
  count: number;
}

interface ListPageLayoutProps<T> {
  title: string;
  count: number;
  subtitle?: string;
  breadcrumbs: string[];
  columns: Column<T>[];
  data: T[];
  filters?: Filter[];
  rowActions?: RowAction<T>[];
  emptyMessage: string;
  emptyCta?: { label: string; route: string };
  searchPlaceholder?: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onRowClick?: (row: T) => void;
  getRowId: (row: T) => string;
  urlParamFilters?: UrlParamFilter[];
  customHeaderContent?: React.ReactNode;
  pageKey?: PageKey;
}

export function ListPageLayout<T>({
  title,
  count,
  subtitle,
  breadcrumbs,
  columns,
  data,
  filters = [],
  rowActions = [],
  emptyMessage,
  emptyCta,
  searchPlaceholder = "Search by name or ID...",
  isLoading = false,
  isError = false,
  onRetry,
  onRowClick,
  getRowId,
  urlParamFilters = [],
  customHeaderContent,
  pageKey = "default",
}: ListPageLayoutProps<T>) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"table" | "compact">("table");
  const pageSize = 25;

  // Get active URL param filter for display in header
  const activeUrlFilter = useMemo(() => {
    for (const filter of urlParamFilters) {
      const paramValue = searchParams.get(filter.paramKey);
      if (paramValue === filter.paramValue) {
        return { label: filter.displayLabel, count: filter.count };
      }
    }
    return null;
  }, [searchParams, urlParamFilters]);

  // Filter chips
  const activeFilterChips = Object.entries(activeFilters)
    .filter(([_, value]) => value && value !== "all")
    .map(([key, value]) => {
      const filter = filters.find((f) => f.key === key);
      const option = filter?.options.find((o) => o.value === value);
      return { key, label: `${filter?.label}: ${option?.label || value}` };
    });

  const removeFilter = (key: string) => {
    setActiveFilters((prev) => ({ ...prev, [key]: "all" }));
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchQuery("");
  };

  // Pagination
  const totalPages = Math.ceil(data.length / pageSize);
  const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      
      <PageContent>
        <AppHeader breadcrumbs={breadcrumbs} />
        
        <main className="p-6">
          {/* Header */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/")}
                  className="h-9 w-9"
                  aria-label="Back to Overview"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-h3 font-semibold text-foreground">
                    {activeUrlFilter ? activeUrlFilter.label : title}
                  </h1>
                  <p className="text-small text-muted-foreground mt-1">{subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {customHeaderContent}
                <CalendarWidget pageKey={pageKey} showSubtext={true} />
              </div>
            </div>
          </Card>

          {/* Controls */}
          <div className="flex items-center justify-between mb-4">
            {/* Filters - Left Side */}
            <div className="flex items-center gap-3">
              {filters.map((filter) => (
                <Select
                  key={filter.key}
                  value={activeFilters[filter.key] || "all"}
                  onValueChange={(value) =>
                    setActiveFilters((prev) => ({ ...prev, [filter.key]: value }))
                  }
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder={`All ${filter.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All {filter.label}s</SelectItem>
                    {filter.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
            </div>

            {/* Search - Right Side */}
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilterChips.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              {activeFilterChips.map((chip) => (
                <Badge key={chip.key} variant="secondary" className="gap-1 pr-1">
                  {chip.label}
                  <button
                    onClick={() => removeFilter(chip.key)}
                    className="ml-1 hover:bg-muted rounded p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear all
              </Button>
            </div>
          )}

          {/* Table */}
          <Card>
            {isLoading ? (
              <div className="p-8">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4 mb-4">
                    {columns.map((_, j) => (
                      <div key={j} className="h-4 bg-muted rounded flex-1 animate-pulse" />
                    ))}
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground mb-4">Failed to load data.</p>
                <Button variant="outline" onClick={onRetry} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </Button>
              </div>
            ) : data.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground mb-4">{emptyMessage}</p>
                {emptyCta && (
                  <Button variant="outline" onClick={() => navigate(emptyCta.route)}>
                    {emptyCta.label}
                  </Button>
                )}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((col) => (
                        <TableHead
                          key={String(col.key)}
                          className={`${col.sortable ? "cursor-pointer select-none" : ""} ${col.headerClassName || ""}`}
                          style={col.width ? { width: col.width, minWidth: col.width } : undefined}
                          onClick={() => col.sortable && handleSort(String(col.key))}
                        >
                          <div className={`flex items-center gap-1 ${col.headerClassName?.includes("text-center") ? "justify-center" : ""}`}>
                            {col.label}
                            {col.sortable && (
                              <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                            )}
                          </div>
                        </TableHead>
                      ))}
                      {rowActions.length > 0 && (
                        <TableHead className="w-[80px]">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((row) => (
                      <TableRow
                        key={getRowId(row)}
                        className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                        onClick={() => onRowClick?.(row)}
                        tabIndex={onRowClick ? 0 : undefined}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && onRowClick) onRowClick(row);
                        }}
                      >
                        {columns.map((col) => (
                          <TableCell key={String(col.key)} className={col.cellClassName} style={col.width ? { width: col.width, minWidth: col.width } : undefined}>
                            {col.render
                              ? col.render(row)
                              : String((row as any)[col.key] ?? "-")}
                          </TableCell>
                        ))}
                        {rowActions.length > 0 && (
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {rowActions
                                  .filter((action) => !action.hidden || !action.hidden(row))
                                  .map((action) => (
                                    <DropdownMenuItem
                                      key={action.label}
                                      onClick={() => action.onClick(row)}
                                      className={action.destructive ? "text-destructive focus:text-destructive" : ""}
                                    >
                                      {action.icon && <span className="mr-2">{action.icon}</span>}
                                      {action.label}
                                    </DropdownMenuItem>
                                  ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-small text-muted-foreground">
                    Showing {((currentPage - 1) * pageSize) + 1} to{" "}
                    {Math.min(currentPage * pageSize, data.length)} of {data.length} results
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-small text-muted-foreground px-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </main>
      </PageContent>
    </div>
  );
}
