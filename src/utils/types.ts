export interface Item {
  id: string;
  type: 'found' | 'lost';
  title: string;
  description: string;
  location: string;
  date: string; // ISO string
  phoneNumber: string; // contact phone
  imageData?: string; // base64 encoded image
  keywords: string[]; // for matching
  userId: string;
  createdAt: string;
}