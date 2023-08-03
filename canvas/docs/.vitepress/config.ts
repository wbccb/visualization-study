import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "canvas",
  description: "canvas电子书",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
    ],

    sidebar: [
      {
        text: '基础用法',
        items: [
          { text: '基础知识', link: '/1-base/0-quick-start' },
          { text: '着色', link: '/1-base/1-color' },
          { text: '文本', link: '/1-base/2-text' },
          { text: 'image', link: '/1-base/3-image' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/wbccb' }
    ]
  }
})
