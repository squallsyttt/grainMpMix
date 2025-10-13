/**
 * 门店 Mock 数据
 */

import { StoreListItem } from '../../types/store'

/**
 * Mock 门店列表数据
 */
export const mockStoreList: StoreListItem[] = [
  {
    id: 1,
    name: '朝阳门店',
    address: '北京市朝阳区测试路1号',
    latitude: 39.904030,
    longitude: 116.407526,
    phone: '010-12345678',
    business_hours: '09:00-21:00',
    is_active: 1,
    distance: 1.2 // 1.2公里
  },
  {
    id: 2,
    name: '海淀门店',
    address: '北京市海淀区中关村大街100号',
    latitude: 39.983424,
    longitude: 116.318977,
    phone: '010-87654321',
    business_hours: '08:00-22:00',
    is_active: 1,
    distance: 3.5
  },
  {
    id: 3,
    name: '西城门店',
    address: '北京市西城区金融街8号',
    latitude: 39.913693,
    longitude: 116.358891,
    phone: '010-55556666',
    business_hours: '09:30-20:30',
    is_active: 1,
    distance: 5.8
  },
  {
    id: 4,
    name: '东城门店',
    address: '北京市东城区王府井大街1号',
    latitude: 39.908823,
    longitude: 116.407526,
    phone: '010-99998888',
    business_hours: '10:00-20:00',
    is_active: 1,
    distance: 2.3
  },
  {
    id: 5,
    name: '丰台门店（暂停营业）',
    address: '北京市丰台区西三环南路1号',
    latitude: 39.858427,
    longitude: 116.286968,
    phone: '010-77776666',
    business_hours: '09:00-21:00',
    is_active: 0,
    distance: 8.5
  }
]
