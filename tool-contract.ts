export interface ToolRequest {
  tool: string;
  action: string;
  query: string;
  context?: any;
}

export interface ToolResponse {
  data: any;
  sources?: string[];
  confidence?: number;
  meta?: Record<string, any>;
}

