export interface PaginatedResponse<T> {
  total: number;
  records: T[];
}
