import React from 'react'
import { View } from '@tarojs/components'
import { Skeleton } from '@nutui/nutui-react-taro'
import './index.less'

interface ArticleCardSkeletonProps {
  count?: number
}

/**
 * 资讯卡片骨架屏组件
 * 与实际卡片结构完全对应
 */
const ArticleCardSkeleton: React.FC<ArticleCardSkeletonProps> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} className='skeleton-article-card'>
          <View className='skeleton-content'>
            {/* 顶部：分类标签和时间 */}
            <View className='skeleton-header'>
              <Skeleton width="70px" height="22px" animated radius="10px" />
              <Skeleton width="90px" height="14px" animated radius="8px" />
            </View>

            {/* 标题 */}
            <View className='skeleton-title'>
              <Skeleton width="100%" height="18px" animated radius="4px" />
              <Skeleton width="85%" height="18px" animated radius="4px" style={{ marginTop: '8px' }} />
            </View>

            {/* 摘要 */}
            <View className='skeleton-summary'>
              <Skeleton width="100%" height="15px" animated radius="4px" />
              <Skeleton width="95%" height="15px" animated radius="4px" style={{ marginTop: '6px' }} />
            </View>

            {/* 底部：浏览量 */}
            <View className='skeleton-footer'>
              <Skeleton width="70px" height="26px" animated radius="12px" />
            </View>
          </View>

          {/* 封面图 */}
          <View className='skeleton-cover'>
            <Skeleton width="110px" height="110px" animated radius="12px" />
          </View>
        </View>
      ))}
    </>
  )
}

export default ArticleCardSkeleton
