/**
 * 성경 카탈로그 데이터
 * 66권 전체 + 카테고리 정보
 */

import type { BibleBook, BibleCategory } from '@/types';

// ============================================
// 구약 39권
// ============================================

export const OT_BOOKS: BibleBook[] = [
  // 모세오경 (5권)
  { id: 'gen', name: '창세기', shortName: '창', chaptersCount: 50, testament: 'OT', category: 'pentateuch', order: 1 },
  { id: 'exo', name: '출애굽기', shortName: '출', chaptersCount: 40, testament: 'OT', category: 'pentateuch', order: 2 },
  { id: 'lev', name: '레위기', shortName: '레', chaptersCount: 27, testament: 'OT', category: 'pentateuch', order: 3 },
  { id: 'num', name: '민수기', shortName: '민', chaptersCount: 36, testament: 'OT', category: 'pentateuch', order: 4 },
  { id: 'deu', name: '신명기', shortName: '신', chaptersCount: 34, testament: 'OT', category: 'pentateuch', order: 5 },

  // 역사서 (12권)
  { id: 'jos', name: '여호수아', shortName: '수', chaptersCount: 24, testament: 'OT', category: 'history', order: 6 },
  { id: 'jdg', name: '사사기', shortName: '삿', chaptersCount: 21, testament: 'OT', category: 'history', order: 7 },
  { id: 'rut', name: '룻기', shortName: '룻', chaptersCount: 4, testament: 'OT', category: 'history', order: 8 },
  { id: '1sa', name: '사무엘상', shortName: '삼상', chaptersCount: 31, testament: 'OT', category: 'history', order: 9 },
  { id: '2sa', name: '사무엘하', shortName: '삼하', chaptersCount: 24, testament: 'OT', category: 'history', order: 10 },
  { id: '1ki', name: '열왕기상', shortName: '왕상', chaptersCount: 22, testament: 'OT', category: 'history', order: 11 },
  { id: '2ki', name: '열왕기하', shortName: '왕하', chaptersCount: 25, testament: 'OT', category: 'history', order: 12 },
  { id: '1ch', name: '역대상', shortName: '대상', chaptersCount: 29, testament: 'OT', category: 'history', order: 13 },
  { id: '2ch', name: '역대하', shortName: '대하', chaptersCount: 36, testament: 'OT', category: 'history', order: 14 },
  { id: 'ezr', name: '에스라', shortName: '스', chaptersCount: 10, testament: 'OT', category: 'history', order: 15 },
  { id: 'neh', name: '느헤미야', shortName: '느', chaptersCount: 13, testament: 'OT', category: 'history', order: 16 },
  { id: 'est', name: '에스더', shortName: '에', chaptersCount: 10, testament: 'OT', category: 'history', order: 17 },

  // 시가서 (5권)
  { id: 'job', name: '욥기', shortName: '욥', chaptersCount: 42, testament: 'OT', category: 'poetry', order: 18 },
  { id: 'psa', name: '시편', shortName: '시', chaptersCount: 150, testament: 'OT', category: 'poetry', order: 19 },
  { id: 'pro', name: '잠언', shortName: '잠', chaptersCount: 31, testament: 'OT', category: 'poetry', order: 20 },
  { id: 'ecc', name: '전도서', shortName: '전', chaptersCount: 12, testament: 'OT', category: 'poetry', order: 21 },
  { id: 'sng', name: '아가', shortName: '아', chaptersCount: 8, testament: 'OT', category: 'poetry', order: 22 },

  // 대선지서 (5권)
  { id: 'isa', name: '이사야', shortName: '사', chaptersCount: 66, testament: 'OT', category: 'major_prophets', order: 23 },
  { id: 'jer', name: '예레미야', shortName: '렘', chaptersCount: 52, testament: 'OT', category: 'major_prophets', order: 24 },
  { id: 'lam', name: '예레미야애가', shortName: '애', chaptersCount: 5, testament: 'OT', category: 'major_prophets', order: 25 },
  { id: 'ezk', name: '에스겔', shortName: '겔', chaptersCount: 48, testament: 'OT', category: 'major_prophets', order: 26 },
  { id: 'dan', name: '다니엘', shortName: '단', chaptersCount: 12, testament: 'OT', category: 'major_prophets', order: 27 },

  // 소선지서 (12권)
  { id: 'hos', name: '호세아', shortName: '호', chaptersCount: 14, testament: 'OT', category: 'minor_prophets', order: 28 },
  { id: 'jol', name: '요엘', shortName: '욜', chaptersCount: 3, testament: 'OT', category: 'minor_prophets', order: 29 },
  { id: 'amo', name: '아모스', shortName: '암', chaptersCount: 9, testament: 'OT', category: 'minor_prophets', order: 30 },
  { id: 'oba', name: '오바댜', shortName: '옵', chaptersCount: 1, testament: 'OT', category: 'minor_prophets', order: 31 },
  { id: 'jon', name: '요나', shortName: '욘', chaptersCount: 4, testament: 'OT', category: 'minor_prophets', order: 32 },
  { id: 'mic', name: '미가', shortName: '미', chaptersCount: 7, testament: 'OT', category: 'minor_prophets', order: 33 },
  { id: 'nam', name: '나훔', shortName: '나', chaptersCount: 3, testament: 'OT', category: 'minor_prophets', order: 34 },
  { id: 'hab', name: '하박국', shortName: '합', chaptersCount: 3, testament: 'OT', category: 'minor_prophets', order: 35 },
  { id: 'zep', name: '스바냐', shortName: '습', chaptersCount: 3, testament: 'OT', category: 'minor_prophets', order: 36 },
  { id: 'hag', name: '학개', shortName: '학', chaptersCount: 2, testament: 'OT', category: 'minor_prophets', order: 37 },
  { id: 'zec', name: '스가랴', shortName: '슥', chaptersCount: 14, testament: 'OT', category: 'minor_prophets', order: 38 },
  { id: 'mal', name: '말라기', shortName: '말', chaptersCount: 4, testament: 'OT', category: 'minor_prophets', order: 39 },
];

// ============================================
// 신약 27권
// ============================================

export const NT_BOOKS: BibleBook[] = [
  // 4복음서 (4권)
  { id: 'mat', name: '마태복음', shortName: '마', chaptersCount: 28, testament: 'NT', category: 'gospels', order: 40 },
  { id: 'mrk', name: '마가복음', shortName: '막', chaptersCount: 16, testament: 'NT', category: 'gospels', order: 41 },
  { id: 'luk', name: '누가복음', shortName: '눅', chaptersCount: 24, testament: 'NT', category: 'gospels', order: 42 },
  { id: 'jhn', name: '요한복음', shortName: '요', chaptersCount: 21, testament: 'NT', category: 'gospels', order: 43 },

  // 사도행전 (1권)
  { id: 'act', name: '사도행전', shortName: '행', chaptersCount: 28, testament: 'NT', category: 'acts', order: 44 },

  // 바울서신 (13권)
  { id: 'rom', name: '로마서', shortName: '롬', chaptersCount: 16, testament: 'NT', category: 'paul', order: 45 },
  { id: '1co', name: '고린도전서', shortName: '고전', chaptersCount: 16, testament: 'NT', category: 'paul', order: 46 },
  { id: '2co', name: '고린도후서', shortName: '고후', chaptersCount: 13, testament: 'NT', category: 'paul', order: 47 },
  { id: 'gal', name: '갈라디아서', shortName: '갈', chaptersCount: 6, testament: 'NT', category: 'paul', order: 48 },
  { id: 'eph', name: '에베소서', shortName: '엡', chaptersCount: 6, testament: 'NT', category: 'paul', order: 49 },
  { id: 'php', name: '빌립보서', shortName: '빌', chaptersCount: 4, testament: 'NT', category: 'paul', order: 50 },
  { id: 'col', name: '골로새서', shortName: '골', chaptersCount: 4, testament: 'NT', category: 'paul', order: 51 },
  { id: '1th', name: '데살로니가전서', shortName: '살전', chaptersCount: 5, testament: 'NT', category: 'paul', order: 52 },
  { id: '2th', name: '데살로니가후서', shortName: '살후', chaptersCount: 3, testament: 'NT', category: 'paul', order: 53 },
  { id: '1ti', name: '디모데전서', shortName: '딤전', chaptersCount: 6, testament: 'NT', category: 'paul', order: 54 },
  { id: '2ti', name: '디모데후서', shortName: '딤후', chaptersCount: 4, testament: 'NT', category: 'paul', order: 55 },
  { id: 'tit', name: '디도서', shortName: '딛', chaptersCount: 3, testament: 'NT', category: 'paul', order: 56 },
  { id: 'phm', name: '빌레몬서', shortName: '몬', chaptersCount: 1, testament: 'NT', category: 'paul', order: 57 },

  // 일반서신 (8권)
  { id: 'heb', name: '히브리서', shortName: '히', chaptersCount: 13, testament: 'NT', category: 'general', order: 58 },
  { id: 'jas', name: '야고보서', shortName: '약', chaptersCount: 5, testament: 'NT', category: 'general', order: 59 },
  { id: '1pe', name: '베드로전서', shortName: '벧전', chaptersCount: 5, testament: 'NT', category: 'general', order: 60 },
  { id: '2pe', name: '베드로후서', shortName: '벧후', chaptersCount: 3, testament: 'NT', category: 'general', order: 61 },
  { id: '1jn', name: '요한1서', shortName: '요일', chaptersCount: 5, testament: 'NT', category: 'general', order: 62 },
  { id: '2jn', name: '요한2서', shortName: '요이', chaptersCount: 1, testament: 'NT', category: 'general', order: 63 },
  { id: '3jn', name: '요한3서', shortName: '요삼', chaptersCount: 1, testament: 'NT', category: 'general', order: 64 },
  { id: 'jud', name: '유다서', shortName: '유', chaptersCount: 1, testament: 'NT', category: 'general', order: 65 },

  // 요한계시록 (1권)
  { id: 'rev', name: '요한계시록', shortName: '계', chaptersCount: 22, testament: 'NT', category: 'revelation', order: 66 },
];

// ============================================
// 전체 성경
// ============================================

export const ALL_BOOKS: BibleBook[] = [...OT_BOOKS, ...NT_BOOKS];

// ============================================
// 카테고리 정의
// ============================================

export const OT_CATEGORIES: BibleCategory[] = [
  { id: 'pentateuch', name: '모세오경', testament: 'OT', books: ['gen', 'exo', 'lev', 'num', 'deu'] },
  { id: 'history', name: '역사서', testament: 'OT', books: ['jos', 'jdg', 'rut', '1sa', '2sa', '1ki', '2ki', '1ch', '2ch', 'ezr', 'neh', 'est'] },
  { id: 'poetry', name: '시가서', testament: 'OT', books: ['job', 'psa', 'pro', 'ecc', 'sng'] },
  { id: 'major_prophets', name: '대선지서', testament: 'OT', books: ['isa', 'jer', 'lam', 'ezk', 'dan'] },
  { id: 'minor_prophets', name: '소선지서', testament: 'OT', books: ['hos', 'jol', 'amo', 'oba', 'jon', 'mic', 'nam', 'hab', 'zep', 'hag', 'zec', 'mal'] },
];

export const NT_CATEGORIES: BibleCategory[] = [
  { id: 'gospels', name: '4복음서', testament: 'NT', books: ['mat', 'mrk', 'luk', 'jhn'] },
  { id: 'acts', name: '사도행전', testament: 'NT', books: ['act'] },
  { id: 'paul', name: '바울서신', testament: 'NT', books: ['rom', '1co', '2co', 'gal', 'eph', 'php', 'col', '1th', '2th', '1ti', '2ti', 'tit', 'phm'] },
  { id: 'general', name: '일반서신', testament: 'NT', books: ['heb', 'jas', '1pe', '2pe', '1jn', '2jn', '3jn', 'jud'] },
  { id: 'revelation', name: '요한계시록', testament: 'NT', books: ['rev'] },
];

export const ALL_CATEGORIES: BibleCategory[] = [...OT_CATEGORIES, ...NT_CATEGORIES];

// ============================================
// 유틸리티 함수
// ============================================

export function getBookById(id: string): BibleBook | undefined {
  return ALL_BOOKS.find(book => book.id === id);
}

export function getBooksByCategory(categoryId: string): BibleBook[] {
  return ALL_BOOKS.filter(book => book.category === categoryId);
}

export function getBooksByTestament(testament: 'OT' | 'NT'): BibleBook[] {
  return ALL_BOOKS.filter(book => book.testament === testament);
}

export function getCategoryById(id: string): BibleCategory | undefined {
  return ALL_CATEGORIES.find(cat => cat.id === id);
}

export function getTotalChapters(testament?: 'OT' | 'NT'): number {
  const books = testament ? getBooksByTestament(testament) : ALL_BOOKS;
  return books.reduce((sum, book) => sum + book.chaptersCount, 0);
}

// 총 장 수: 구약 929장, 신약 260장, 전체 1189장
