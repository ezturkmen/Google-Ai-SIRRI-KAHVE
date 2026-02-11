
export type FortuneCategory = 'coffee' | 'tarot' | 'astrology';

export interface UserProfile {
  name: string;
  birthDate: string;
}

export interface FortuneResult {
  id: string;
  category: FortuneCategory;
  date: string;
  symbols?: string[]; 
  cards?: string[]; 
  sign?: string; 
  interpretation: string; // Birleştirilmiş Geçmiş, Şimdi ve Gelecek yorumu
  advice: string;
  imageUrl?: string; 
  userProfile?: UserProfile; 
}

export interface AppState {
  view: 'setup' | 'dashboard' | 'coffee' | 'tarot' | 'astrology' | 'journal';
  status: 'idle' | 'analyzing' | 'result';
  profile: UserProfile | null;
  images: string[];
  selectedCards: string[];
  selectedSign: string;
  result: FortuneResult | null;
  error: string | null;
}
