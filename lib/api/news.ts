import Parser from 'rss-parser';

const parser = new Parser();

export async function getGoogleNews(symbol: string) {
    try {
        // Query Google News RSS for the stock ticker
        // Using q=symbol+stock ensures relevant financial news
        const feed = await parser.parseURL(`https://news.google.com/rss/search?q=${encodeURIComponent(symbol)}+stock&hl=en-US&gl=US&ceid=US:en`);

        if (!feed.items || feed.items.length === 0) return [];

        return feed.items.slice(0, 8).map(item => ({
            id: item.guid || Math.random().toString(),
            title: cleanHeadline(item.title || ""),
            summary: item.contentSnippet || item.title,
            source: item.source?.toString() || extractSource(item.title || ""),
            timeAgo: item.pubDate ? formatDate(item.pubDate) : "Recent",
            url: item.link
        }));
    } catch (error) {
        console.error("News RSS Error:", error);
        return [];
    }
}

function cleanHeadline(title: string) {
    // Google News titles often include " - Source" at the end
    return title.split(' - ')[0];
}

function extractSource(title: string) {
    const parts = title.split(' - ');
    return parts.length > 1 ? parts[parts.length - 1] : "Google News";
}

function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
