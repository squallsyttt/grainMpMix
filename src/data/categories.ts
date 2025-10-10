// 产品分类数据
export interface Category {
  id: string;
  name: string;
  count: number;
  icon?: string;
}

export const categories: Category[] = [
  {
    id: 'rice',
    name: '糯米专区',
    count: 28,
  },
  {
    id: 'millet',
    name: '细米专区',
    count: 15,
  },
  {
    id: 'wheat',
    name: '碎米专区',
    count: 12,
  },
  {
    id: 'organic',
    name: '有机米专区',
    count: 8,
  },
  {
    id: 'glutinous',
    name: '糯米专区',
    count: 10,
  },
  {
    id: 'special',
    name: '特价专区',
    count: 20,
  },
];
