// 轮播Banner数据
export interface BannerItem {
  id: string;
  imageUrl: string;
  title?: string;
  link?: string;
}

export const banners: BannerItem[] = [
  {
    id: 'banner1',
    imageUrl: 'https://via.placeholder.com/750x300/FF6B35/FFFFFF?text=优质糯米新鲜上市',
    title: '优质糯米新鲜上市',
  },
  {
    id: 'banner2',
    imageUrl: 'https://via.placeholder.com/750x300/4CAF50/FFFFFF?text=有机大米健康之选',
    title: '有机大米健康之选',
  },
  {
    id: 'banner3',
    imageUrl: 'https://via.placeholder.com/750x300/2196F3/FFFFFF?text=特价专区限时抢购',
    title: '特价专区限时抢购',
  },
];
