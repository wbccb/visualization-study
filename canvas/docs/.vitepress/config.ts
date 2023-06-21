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
          { text: '快速开始', link: '/1-base/quick-start' },
        ]
      },
      {
        text: '性能优化',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/wbccb' }
    ]
  }
})
