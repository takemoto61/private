import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang:"ja-JP",
  base: '/private/', // サイトがサブパスで提供される場合のベースパス
  title: "Documents & Papers",
  description: "Store documents & Papers for Private",
  // if base is set, use /base/favicon.ico
   head: [['link', { rel: 'icon', href: '/private/favicon.ico' }]],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],
    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],
    footer: {
      message: '知足安分・明鏡止水 急迫敗事・寧耐成事',
      copyright: 'Copyright © Masaki Takemoto'
    },    
    returnToTopLabel: '🔝ページ先頭へ',
    /*
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
    */
  }
})
