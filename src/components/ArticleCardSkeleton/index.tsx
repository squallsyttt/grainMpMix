import React from 'react'
import { View } from '@tarojs/components'
import { Skeleton } from '@nutui/nutui-react-taro'
import './index.less'

interface ArticleCardSkeletonProps {
  count?: number
}

const ArticleCardSkeleton: React.FC<ArticleCardSkeletonProps> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} className='skeleton-article-card'>
          <View className='skeleton-content'>
            {/* 顶部标签和时间 */}
            <View className='skeleton-header'>
              <Skeleton width="60px" height="20px" animated />
              <Skeleton width="80px" height="16px" animated />
            </View>

            {/* 标题 */}
            <View className='skeleton-title'>
              <Skeleton width="100%" height="20px" animated />
              <Skeleton width="80%" height="20px" animated style={{ marginTop: '8px' }} />
            </View>

            {/* 摘要 */}
            <View className='skeleton-summary'>
              <Skeleton width="100%" height="16px" animated />
              <Skeleton width="90%" height="16px" animated style={{ marginTop: '6px' }} />
            </View>

            {/* 底部浏览量 */}
            <View className='skeleton-footer'>
              <Skeleton width="60px" height="24px" animated radius="12px" />
            </View>
          </View>

          {/* 封面图 */}
          <View className='skeleton-cover'>
            <Skeleton width="120px" height="120px" animated radius="12px" />
          </View>
        </View>
      ))}
    </>
  )
}

export default ArticleCardSkeleton
