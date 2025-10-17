import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import RegionBar from '../../components/RegionBar';
import RegionSelector from '../../components/RegionSelector';
import ArticleCardSkeleton from '../../components/ArticleCardSkeleton';
import { useRegion } from '../../contexts/RegionContext';
import './index.less';

// 导入资讯图片
import news1 from '../../assets/advert/news/news1.png'
import news2 from '../../assets/advert/news/news2.png'
import news3 from '../../assets/advert/news/news3.png'
import news4 from '../../assets/advert/news/news4.png'

// 模拟文章数据
const mockArticles = [
  {
    id: 1,
    title: '粮食市场最新动态：2024年第一季度分析报告',
    summary: '本季度粮食市场整体保持稳定，主要粮食作物价格小幅波动，供需关系平衡...',
    cover: news1,
    category: '市场动态',
    publishTime: '2024-01-15',
    views: 1280
  },
  {
    id: 2,
    title: '智慧农业新趋势：科技助力粮食生产',
    summary: '随着物联网、大数据、人工智能等技术的发展，智慧农业正在改变传统粮食生产方式...',
    cover: news2,
    category: '科技前沿',
    publishTime: '2024-01-12',
    views: 2156
  },
  {
    id: 3,
    title: '粮食储备管理新规解读',
    summary: '国家最新发布的粮食储备管理办法，对粮食安全保障提出了更高要求...',
    cover: news3,
    category: '政策法规',
    publishTime: '2024-01-10',
    views: 986
  },
  {
    id: 4,
    title: '优质粮食工程实施成效显著',
    summary: '自优质粮食工程实施以来，粮食品质持续提升，农民收入稳步增长...',
    cover: news4,
    category: '行业新闻',
    publishTime: '2024-01-08',
    views: 1542
  },
  {
    id: 5,
    title: '绿色储粮技术推广应用实践',
    summary: '绿色储粮技术的推广，有效降低了粮食损耗，提高了储粮质量和经济效益...',
    cover: news1,
    category: '技术应用',
    publishTime: '2024-01-05',
    views: 1103
  },
  {
    id: 6,
    title: '粮食供应链数字化转型路径探索',
    summary: '数字化转型正在重塑粮食供应链各个环节，提升效率和透明度...',
    cover: news2,
    category: '数字化',
    publishTime: '2024-01-03',
    views: 1876
  }
];

function News() {
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<typeof mockArticles>([]);
  const [dataReady, setDataReady] = useState(false); // 接口数据是否就绪
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({}); // 追踪每张图片的加载状态
  const { province, city, showSelector, closeSelector, setRegion } = useRegion();

  const categories = [
    { id: 'all', name: '全部' },
    { id: 'market', name: '市场动态' },
    { id: 'policy', name: '政策法规' },
    { id: 'tech', name: '科技前沿' },
    { id: 'industry', name: '行业新闻' }
  ];

  // 模拟数据加载
  useEffect(() => {
    loadArticles();
  }, []);

  // 切换分类时重新加载
  useEffect(() => {
    loadArticles();
  }, [activeTab]);

  // 监听数据和图片加载状态，只有全部完成才隐藏 skeleton
  useEffect(() => {
    if (!dataReady) return;

    // 检查所有图片是否都已加载
    const allImagesLoaded = articles.length > 0 &&
      articles.every(article => imagesLoaded[article.id] === true);

    if (allImagesLoaded) {
      // 所有资源都加载完成，隐藏 skeleton
      setLoading(false);
      return;
    }

    // 添加超时保护：数据就绪后最多等待 2 秒
    // 如果图片一直没加载完（例如被小程序域名限制），强制隐藏 skeleton
    const timeout = setTimeout(() => {
      console.warn('图片加载超时，强制显示内容');
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [dataReady, imagesLoaded, articles]);

  const loadArticles = async () => {
    // 重置状态
    setLoading(true);
    setDataReady(false);
    setImagesLoaded({});

    // 模拟网络请求延迟
    await new Promise(resolve => setTimeout(resolve, 1500));
    setArticles(mockArticles);

    // 标记数据已就绪，但不隐藏 loading，等待图片加载完成
    setDataReady(true);
  };

  // 图片加载完成的回调
  const handleImageLoad = (articleId: number) => {
    console.log(`图片加载成功: article ${articleId}`);
    setImagesLoaded(prev => ({
      ...prev,
      [articleId]: true
    }));
  };

  // 图片加载失败的回调（也视为加载完成，避免无限等待）
  const handleImageError = (articleId: number) => {
    console.warn(`图片加载失败: article ${articleId}`);
    setImagesLoaded(prev => ({
      ...prev,
      [articleId]: true
    }));
  };

  const handleArticleClick = (id: number) => {
    Taro.navigateTo({
      url: `/pages/news/detail?id=${id}`
    });
  };

  return (
    <View className='news-page'>
      {/* 地区选择器 */}
      <RegionBar />

      {/* 分类标签栏 */}
      <View className='category-tabs'>
        <ScrollView scrollX className='tabs-scroll'>
          {categories.map(cat => (
            <View
              key={cat.id}
              className={`tab-item ${activeTab === cat.id ? 'active' : ''}`}
              onClick={() => setActiveTab(cat.id)}
            >
              <Text className='tab-text'>{cat.name}</Text>
              {activeTab === cat.id && <View className='tab-indicator' />}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* 文章列表 */}
      <ScrollView scrollY className='article-list'>
        {loading ? (
          // 显示骨架屏
          <ArticleCardSkeleton count={5} />
        ) : (
          // 显示真实数据
          articles.map(article => (
            <View
              key={article.id}
              className='article-card'
              onClick={() => handleArticleClick(article.id)}
            >
              <View className='article-content'>
                <View className='article-header'>
                  <Text className='article-category'>{article.category}</Text>
                  <Text className='article-time'>{article.publishTime}</Text>
                </View>
                <Text className='article-title'>{article.title}</Text>
                <Text className='article-summary'>{article.summary}</Text>
                <View className='article-footer'>
                  <View className='article-views'>
                    <Text className='views-icon'>👁</Text>
                    <Text className='views-text'>{article.views}</Text>
                  </View>
                </View>
              </View>
              <Image
                className='article-cover'
                src={article.cover}
                mode='aspectFill'
                onLoad={() => handleImageLoad(article.id)}
                onError={() => handleImageError(article.id)}
              />
            </View>
          ))
        )}
      </ScrollView>
      
      {/* 地区选择弹窗 */}
      <RegionSelector
        visible={showSelector}
        onClose={closeSelector}
        onConfirm={setRegion}
        defaultProvince={province}
        defaultCity={city}
      />
    </View>
  );
}

export default News;

