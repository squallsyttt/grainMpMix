// 导入 banner 图片
import banner1 from '../assets/advert/banner/banner1.png'
import banner2 from '../assets/advert/banner/banner2.png'
import banner3 from '../assets/advert/banner/banner3.png'

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
    imageUrl: banner1,
    title: '优质糯米新鲜上市',
  },
  {
    id: 'banner2',
    imageUrl: banner2,
    title: '有机大米健康之选',
  },
  {
    id: 'banner3',
    imageUrl: banner3,
    title: '特价专区限时抢购',
  },
];
