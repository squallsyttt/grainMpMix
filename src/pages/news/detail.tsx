import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import './detail.less';

// 导入资讯详情图片
import news1 from '../../assets/advert/news/news1.png'
import news2 from '../../assets/advert/news/news2.png'

// 模拟文章详情数据
const mockArticleDetail = {
  1: {
    id: 1,
    title: '粮食市场最新动态：2024年第一季度分析报告',
    cover: news1,
    category: '市场动态',
    publishTime: '2024-01-15 10:30',
    author: '市场分析部',
    views: 1280,
    content: `
<p>2024年第一季度，全国粮食市场运行总体平稳，主要粮食品种价格在合理区间内小幅波动。本报告将从供需关系、价格走势、市场预期等多个维度进行深入分析。</p>

<h2>一、市场供需总体平衡</h2>
<p>本季度粮食供应充足，市场需求稳定。主产区粮食收购进度正常，储备粮轮换有序进行。从供给端看，去年秋粮丰收为今年市场供应奠定了良好基础；从需求端看，口粮消费保持稳定，饲料和工业用粮需求略有增长。</p>

<h2>二、价格走势分析</h2>
<p>稻谷价格保持稳定，小麦价格小幅上涨，玉米价格在春节后出现季节性回调。具体来看：</p>
<ul>
  <li><strong>稻谷：</strong>早籼稻、中晚籼稻和粳稻价格均保持平稳，市场购销活跃度适中。</li>
  <li><strong>小麦：</strong>受制粉企业补库需求增加影响，优质小麦价格小幅上涨2-3%。</li>
  <li><strong>玉米：</strong>春节后下游需求回落，价格出现5%左右的季节性回调。</li>
</ul>

<h2>三、市场特点与趋势</h2>
<p>当前粮食市场呈现以下几个特点：</p>
<ol>
  <li>政策性收购托底作用明显，市场预期稳定</li>
  <li>优质优价特征突出，品质好的粮食更受市场青睐</li>
  <li>产销衔接更加顺畅，现代物流体系建设成效显现</li>
  <li>线上交易占比持续提升，数字化转型加速</li>
</ol>

<h2>四、后市展望</h2>
<p>展望第二季度，随着春耕生产全面展开和夏粮即将收获，预计粮食市场将继续保持稳定运行态势。建议相关主体密切关注天气变化、国际市场动态以及政策调整，合理安排购销节奏，规避市场风险。</p>

<p>各类市场主体应当抓住当前有利时机，积极参与优质粮食工程建设，提升粮食品质，优化供给结构，更好地满足人民群众对高品质粮油产品的需求。</p>
`
  },
  2: {
    id: 2,
    title: '智慧农业新趋势：科技助力粮食生产',
    cover: news2,
    category: '科技前沿',
    publishTime: '2024-01-12 14:20',
    author: '科技创新部',
    views: 2156,
    content: `
<p>随着物联网、大数据、人工智能等新一代信息技术的快速发展，智慧农业正在深刻改变传统粮食生产方式，为保障国家粮食安全提供了强有力的科技支撑。</p>

<h2>一、智慧农业发展现状</h2>
<p>目前，我国智慧农业发展取得显著成效：</p>
<ul>
  <li>农业物联网应用加速普及，传感器、无人机等智能设备广泛应用于田间管理</li>
  <li>农业大数据平台建设稳步推进，为科学决策提供数据支撑</li>
  <li>精准农业技术不断成熟，实现了对作物生长的精细化管理</li>
  <li>智能农机装备水平持续提升，大幅提高了农业生产效率</li>
</ul>

<h2>二、关键技术应用</h2>
<p>在粮食生产领域，以下几项关键技术的应用尤为突出：</p>
<p><strong>1. 遥感监测技术</strong>：通过卫星遥感和无人机巡航，实现对农田的实时监测，准确掌握作物长势、病虫害发生等情况。</p>
<p><strong>2. 精准灌溉系统</strong>：根据土壤墒情、气象条件等数据，自动调节灌溉量和灌溉时间，实现水资源的高效利用。</p>
<p><strong>3. 智能施肥技术</strong>：基于土壤养分检测和作物需肥规律，实现肥料的精准施用，既提高了肥料利用率，又减少了环境污染。</p>
<p><strong>4. 病虫害智能识别</strong>：利用图像识别技术，快速诊断病虫害类型，为及时防治提供依据。</p>

<h2>三、典型应用案例</h2>
<p>某粮食主产区建设的智慧农业示范园区，集成应用了多项先进技术，取得了良好效果：</p>
<ul>
  <li>粮食产量提高15%以上</li>
  <li>化肥使用量减少20%</li>
  <li>农药使用量减少30%</li>
  <li>灌溉用水节约25%</li>
  <li>人工成本降低40%</li>
</ul>

<h2>四、未来发展趋势</h2>
<p>展望未来，智慧农业将呈现以下发展趋势：</p>
<ol>
  <li><strong>技术融合创新</strong>：5G、区块链等新技术将与智慧农业深度融合</li>
  <li><strong>平台化发展</strong>：构建综合性智慧农业服务平台，提供一站式解决方案</li>
  <li><strong>规模化应用</strong>：从示范推广向大规模应用转变</li>
  <li><strong>绿色化导向</strong>：更加注重可持续发展和生态环境保护</li>
</ol>

<p>智慧农业的发展为粮食生产现代化开辟了新路径，我们要抓住机遇，加快推进农业科技创新，为端牢中国饭碗提供更加坚实的科技支撑。</p>
`
  }
};

function NewsDetail() {
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);

  useEffect(() => {
    const { id } = router.params;
    if (id) {
      // 模拟从后台获取数据
      const detail = mockArticleDetail[id] || mockArticleDetail[1];
      setArticle(detail);

      // 设置页面标题
      Taro.setNavigationBarTitle({
        title: '资讯详情'
      });
    }
  }, [router.params]);

  if (!article) {
    return (
      <View className='loading'>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView scrollY className='detail-page'>
      {/* 封面图 */}
      <Image className='cover-image' src={article.cover} mode='aspectFill' />

      {/* 文章信息 */}
      <View className='article-info'>
        <View className='article-category-tag'>{article.category}</View>
        <Text className='article-title'>{article.title}</Text>

        <View className='article-meta'>
          <View className='meta-item'>
            <Text className='meta-label'>作者：</Text>
            <Text className='meta-value'>{article.author}</Text>
          </View>
          <View className='meta-item'>
            <Text className='meta-label'>发布时间：</Text>
            <Text className='meta-value'>{article.publishTime}</Text>
          </View>
          <View className='meta-item'>
            <Text className='meta-icon'>👁</Text>
            <Text className='meta-value'>{article.views}</Text>
          </View>
        </View>
      </View>

      {/* 文章内容 */}
      <View className='article-body'>
        <View
          className='article-content'
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </View>
    </ScrollView>
  );
}

export default NewsDetail;
