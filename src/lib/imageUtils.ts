/**
 * Firebase Storage の直接URLを新しいメディアルートに変換する
 * @param url Firebase Storage の直接URL または既に変換済みのメディアルート
 * @returns 新しいメディアルート形式のURL
 */
export function convertToMediaRoute(url: string): string {
  // 既にメディアルート形式の場合はそのまま返す
  if (url.startsWith('/media/')) {
    return url;
  }

  // Firebase Storage の直接URLの場合
  if (url.includes('firebasestorage.googleapis.com') || url.includes('storage.googleapis.com')) {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      // パスから "o/" の後の部分を取得し、URLデコードする
      const oIndex = pathParts.indexOf('o');
      if (oIndex !== -1 && oIndex + 1 < pathParts.length) {
        const encodedPath = pathParts[oIndex + 1];
        const decodedPath = decodeURIComponent(encodedPath);
        return `/media/${decodedPath}`;
      }
    } catch (error) {
      console.warn('Failed to convert Firebase Storage URL to media route:', url, error);
    }
  }

  // 変換できない場合は元のURLを返す
  return url;
}

/**
 * Markdown コンテンツ内の画像URLを新しいメディアルートに変換する
 * @param content Markdown コンテンツ
 * @returns 変換後のMarkdown コンテンツ
 */
export function convertMarkdownImageUrls(content: string): string {
  // Markdown の画像記法 ![alt](url) を検索して変換
  return content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
    const convertedUrl = convertToMediaRoute(url);
    // URLに白いスペースや特殊文字が含まれている場合は適切にエンコード
    const encodedUrl = encodeURI(convertedUrl);
    return `![${alt}](${encodedUrl})`;
  });
}
