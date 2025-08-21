import { type DefaultTheme, defineConfig } from 'vitepress'
import { generateSidebar }  from 'vitepress-sidebar'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang:"ja-JP",
  base: '/private/', // サイトがサブパスで提供される場合のベースパス
  title: "Documents & Papers",
  description: "Store documents & Papers for Private",
  // if base is set, use /base/favicon.ico
  // make public directory under root 
  // place docs > public > favicon.ico
  head: [['link', { rel: 'icon', href: '/private/favicon.ico' }]],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],
    sidebar: {
      '/': [{
        text: 'Examples',
        collapsed: true,
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      },
      {
        text:'法律',
        link:'/law/'
      }],
    '/law/': sidebarLaws(),
  },
    footer: {
      message: '知足安分・明鏡止水 急迫敗事・寧耐成事',
      copyright: 'Copyright © Masaki Takemoto'
    },    
    returnToTopLabel: '🔝ページ先頭へ',
    search: {
      provider: 'local',
      options: {
        miniSearch: {
          options: {
            tokenize: (term) => {
              if (typeof term === 'string') term = term.toLowerCase()
              const segmenter = Intl.Segmenter && new Intl.Segmenter('ja-JP', { granularity: 'word' })
              if (!segmenter) return [term]
              const tokens = []
              for (const seg of segmenter.segment(term)) {
                // @ts-ignore
                // ignore spaces
                if (seg.segment.trim() !== '') tokens.push(seg.segment);
              }
              return tokens;
            },
          },
        },
      },
    }
    /*
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
    */
  }
})

function sidebarLaws(): DefaultTheme.SidebarItem[] {
  return [{
      text: 'HOME',
      base: '/',
      link:'.'
    },

  ]
}