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
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800',
    title: '优质糯米新鲜上市',
  },
  {
    id: 'banner2',
    imageUrl: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800',
    title: '有机大米健康之选',
  },
  {
    id: 'banner3',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800',
    title: '特价专区限时抢购',
  },
];
