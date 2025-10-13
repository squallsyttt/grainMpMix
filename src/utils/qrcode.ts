/**
 * 二维码生成工具
 *
 * 使用 weapp-qrcode-canvas-2d 或 Taro Canvas API 生成二维码
 *
 * 注意: 使用前需要安装依赖
 * npm install weapp-qrcode-canvas-2d --save
 */

import Taro from '@tarojs/taro'

/**
 * 二维码生成选项
 */
export interface QRCodeOptions {
  /** 二维码内容 */
  text: string
  /** Canvas 元素ID */
  canvasId: string
  /** 二维码尺寸(宽高相同,像素) */
  size?: number
  /** 前景色(默认黑色) */
  foreground?: string
  /** 背景色(默认白色) */
  background?: string
  /** 容错级别(0-3, 0=L 7%, 1=M 15%, 2=Q 25%, 3=H 30%) */
  correctLevel?: 0 | 1 | 2 | 3
  /** 是否显示Logo */
  showLogo?: boolean
  /** Logo图片路径 */
  logoSrc?: string
  /** Logo尺寸(占二维码的百分比,0.2表示20%) */
  logoSize?: number
}

/**
 * 生成二维码
 *
 * @param options - 二维码生成选项
 * @returns Promise<string> - 生成的临时文件路径
 */
export async function generateQRCode(options: QRCodeOptions): Promise<string> {
  const {
    text,
    canvasId,
    size = 260,
    foreground = '#000000',
    background = '#FFFFFF',
    correctLevel = 2, // H级别,30%容错率
    showLogo = false,
    logoSrc = '',
    logoSize = 0.2
  } = options

  try {
    // TODO: 实现二维码生成逻辑
    // 1. 引入 weapp-qrcode-canvas-2d
    // 2. 创建二维码实例
    // 3. 绘制到Canvas
    // 4. 如果需要Logo,叠加Logo
    // 5. 将Canvas导出为临时文件

    // 临时返回空字符串,实际使用时需要实现
    console.warn('[QRCode] 二维码生成功能未实现,请安装 weapp-qrcode-canvas-2d')

    // 示例实现(需要安装依赖后取消注释):
    /*
    const QRCode = require('weapp-qrcode-canvas-2d')

    const qrcode = new QRCode({
      canvas: canvasId,
      canvasId: canvasId,
      useCORS: true,
      correctLevel: correctLevel,
      width: size,
      height: size
    })

    await qrcode.make({
      text: text,
      background: background,
      foreground: foreground
    })

    // 导出为临时文件
    const tempFilePath = await Taro.canvasToTempFilePath({
      canvasId: canvasId,
      fileType: 'png',
      quality: 1
    })

    return tempFilePath.tempFilePath
    */

    return ''
  } catch (error) {
    console.error('[QRCode] 生成二维码失败:', error)
    throw error
  }
}

/**
 * 保存二维码到相册
 *
 * @param filePath - 二维码图片路径
 * @returns Promise<boolean> - 是否保存成功
 */
export async function saveQRCodeToAlbum(filePath: string): Promise<boolean> {
  try {
    // 1. 检查相册权限
    const { authSetting } = await Taro.getSetting()

    if (authSetting['scope.writePhotosAlbum'] === false) {
      // 权限被拒绝过,引导用户打开设置
      const { confirm } = await Taro.showModal({
        title: '需要相册权限',
        content: '请在设置中开启相册权限,以便保存二维码',
        confirmText: '去设置',
        cancelText: '取消'
      })

      if (confirm) {
        await Taro.openSetting()
        // 用户从设置返回后,再次检查权限
        const newSetting = await Taro.getSetting()
        if (newSetting.authSetting['scope.writePhotosAlbum'] === false) {
          Taro.showToast({
            title: '未授权相册权限',
            icon: 'none'
          })
          return false
        }
      } else {
        return false
      }
    }

    // 2. 保存图片到相册
    await Taro.saveImageToPhotosAlbum({
      filePath: filePath
    })

    Taro.showToast({
      title: '已保存到相册',
      icon: 'success'
    })

    return true
  } catch (error: any) {
    console.error('[QRCode] 保存到相册失败:', error)

    // 用户拒绝授权
    if (error.errMsg && error.errMsg.includes('auth deny')) {
      Taro.showToast({
        title: '用户拒绝授权',
        icon: 'none'
      })
    } else {
      Taro.showToast({
        title: '保存失败,请稍后重试',
        icon: 'none'
      })
    }

    return false
  }
}

/**
 * 验证二维码内容格式
 *
 * @param text - 二维码内容
 * @returns boolean - 是否有效
 */
export function validateQRCodeText(text: string): boolean {
  if (!text || text.trim().length === 0) {
    return false
  }

  // 检查长度(二维码最大容量约2953字节)
  if (text.length > 2000) {
    return false
  }

  return true
}
