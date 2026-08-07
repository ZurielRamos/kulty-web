export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  style: string;
  orientation: 'vertical' | 'horizontal';
  gallery: string[];
  mockup: string | null;
  embeddingText: string | null;
  createdAt: string;
}

export interface PaginatedResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
