import React from 'react';
import { View, Text } from '@tarojs/components';
import { categories } from '../../data/categories';
import './index.less';

const ProductCategories: React.FC = () => {
  const handleCategoryClick = (categoryId: string) => {
    // TODO: 跳转到分类页面
  };

  return (
    <View className="product-categories">
      <View className="category-title">产品分类</View>
      <View className="category-grid">
        {categories.map((category) => (
          <View
            key={category.id}
            className="category-item"
            onClick={() => handleCategoryClick(category.id)}
          >
            <View className="category-name">{category.name}</View>
            <View className="category-count">{category.count} 款产品</View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ProductCategories;
