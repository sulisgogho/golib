export interface Book {
  id: string | number;
  title: string;
  author: string;
  category: string;
  coverColor?: string;
  textColor?: string;
  pages: number;
  language: string;
  rating?: number;
  desc: string;
  coverUrl?: string;
  pdfUrl?: string;
  createdAt?: any;
}
