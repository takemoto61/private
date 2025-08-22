---
layout: doc
title:  gitHub
outline: 1
---
# Account

 🔑[アカウント情報](https://septseas-my.sharepoint.com/personal/takemoto_septseas_com/_layouts/Doc.aspx?sourcedoc={A670029D-F259-4DA7-975D-C1B669122ECA}&wd=target%28Application%2F%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%EF%BC%88%E6%A5%AD%E5%8B%99%E7%B3%BB%EF%BC%89.one%7C97A775E2-2EE9-4D18-98E3-9BC7D236F48B%2FGitHub%7C2E9B0708-3AE1-4030-AF44-7EC84C6F505A%2F%29&wdpartid={59487911-4858-04A6-17E2-50356DCBF32D}{1}&wdsectionfileid={17D2579B-EFAF-4DD3-9872-B7A7415D888B})

会社のアカウントは、書類などの保存用に利用します。  
個人アカウントは、プログラムなどに利用します

## guidance

OneDrive Businessに保存しているものをなるべく、sun-green gitHubに格納して、USBなどにCloneとして保存して、バックアップを行います。  

そうすることにより、クラウド上でバックアップファイルを持つことができるので、安心してデータ運用をすることができます 

ただし、Portable Git を利用する場合は、各Windowsの環境設定で、Pathを通さなければいけません。


# PortableGit

USBで、Gitを利用できるようにするために設定。
すでに、I:&yen; で実現していますが、今後バージョンアップがあった時に対応できるように、こちらの[サイト](https://webnote.i-sight.jp/install-portable-git-to-windows/) が、参考になります。

## リモートリポジトリ設定

PCが変わると、USB接続している GitHubとのリモート接続がうまくいきません

エラー

repository ('' is owned by someone else) #148132
Closed

そこで、ディレクトリを信頼してあげる設定を行います

VSCode Powershell

```cmd
PS C:\Users\takem> git config --global --add safe.directory I:/gitHub/myGitHub
PS C:\Users\takem> git config --global --list
user.name=takemoto61
user.email=takemoto.masaki@gmail.com
safe.directory=I:/gitHub/vitepress
safe.directory=I:/gitHub/vue
safe.directory=I:/gitHub/template
safe.directory=I:/gitHub/myGitHub
```

## バージョンアップ

1. [最新バージョン](https://git-scm.com/downloads/win)をダウンロード  
  64-bit Git for Windows Portable
1. そのままでは展開できないので、7-ZipPortable アプリを使って解凍
1. 旧バージョンの PortableGitフォルダーをリネーム (PortableGit_old)
1. 解凍したフォルダを リネーム PortableGit
1. 新しい PortableGit を I:¥ ディレクトリにコピー
1. COMMAND Prompt git -v (新バージョンに変更を確認)

### git fetch

新バージョンにすると、[こちら](https://qiita.com/lx-sasabo/items/e8029579c7657897e9e4)にあるようなエラーが出ますが、

- mananger を選択
- Always use this from now on チェック

正常に動作します

### バージョンアップ履歴

- 2025/01/15  
  Version Up git version 2.41.0.windows.1 ➡ version 2.47.1.windows1

  

## ローカルからの同期

Workspaceを開いて、変更が、左下部分で表示されないが、コマンドプロンプトから、git fetch を行うと表示されるようになります

対策）
git 設定「ctrl+,」で、git autofeth 「true」に変更
デフォルトで、false



# Clone

VSCodeを利用した gitHub Clone

1. gitHubでレポジトリを作成  
  https://github.com/takemoto61/documents
1. クローン用のホルダーを作成  
  C:\gDrive\documents
1. VScode コマンドプロンプト  
  git clone https://github.com/takemoto61/documents c:\gDrive\documents  
  多少のWarningが出てしまいますが、気にしないでください
1. VScode で、c:\gDrive\documents フォルダーを開きます

以上で、クローンが作成されて、VSCodeでも利用可能になります


# 公開

public 

Settings > Code and automation > Pages

Branch
[公開方法](https://docs.github.com/ja/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

# Markdownの「シンタックスハイライト」

[[GitHub] Markdownの「シンタックスハイライト」に対応している言語一覧](https://blog.katsubemakito.net/articles/github-markdown-syntaxhighlighting)

