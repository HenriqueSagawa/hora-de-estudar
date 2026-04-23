export interface ApiResponse<T = unknown> {
  message: string;
  data?: T;
  errors?: ApiFieldError[];
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface DateRangeFilter {
  startDate: Date;
  endDate: Date;
}
