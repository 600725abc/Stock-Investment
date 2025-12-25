import Parser from 'rss-parser';

const parser = new Parser();

// Credible financial news sources (prioritized and comprehensive)
// Organized by tier: Tier 1 (major wire services), Tier 2 (financial media), Tier 3 (regional/specialized)
const CREDIBLE_SOURCES = [
    // Tier 1: Major Wire Services & Global Financial News
    'Reuters',
    'Bloomberg',
    'Associated Press',
    'AP News',
    'Financial Times',
    'Wall Street Journal',
    'WSJ',
    'The Economist',

    // Tier 2: Financial Media (English)
    'CNBC',
    'MarketWatch',
    'Barron\'s',
    'Investor\'s Business Daily',
    'The New York Times',
    'Washington Post',
    'Forbes',
    'Fortune',
    'Business Insider',
    'CNN Business',
    'Seeking Alpha',
    'The Motley Fool',

    // Tier 3: Regional (reduce Yahoo Finance priority by not listing first)

    // Traditional Chinese - Taiwan (繁體中文 - 台灣)
    '經濟日報',           // Economic Daily News
    '工商時報',           // Commercial Times
    '中央通訊社',         // Central News Agency
    '中央社',             // CNA
    '自由時報',           // Liberty Times
    '聯合報',             // United Daily News
    '鉅亨網',             // CNYES
    'MoneyDJ理財網',      // MoneyDJ
    'MoneyDJ',
    '財訊雙週刊',         // Wealth Magazine
    '財訊',
    '天下雜誌',           // CommonWealth Magazine
    '商業周刊',           // Business Weekly
    '今周刊',             // Business Today
    '數位時代',           // Business Next
    '非凡新聞',           // USTV
    '鑽石投資',
    'Anue鉅亨',

    // Traditional Chinese - Hong Kong (繁體中文 - 香港)
    '南華早報',           // South China Morning Post
    'South China Morning Post',
    'SCMP',
    '香港經濟日報',       // Hong Kong Economic Times
    'HKET',
    '信報財經新聞',       // Hong Kong Economic Journal
    '信報',
    '明報',               // Ming Pao
    '星島日報',           // Sing Tao Daily
    '東方日報',           // Oriental Daily
    '文匯報',             // Wen Wei Po
    '經濟通',             // ET Net
    'AAStocks',
    '阿思達克財經網',

    // Yahoo (lower priority - listed last)
    'Yahoo Finance',
    'Yahoo奇摩',
    'Yahoo奇摩股市',
    'ETtoday'
];

function isCredibleSource(source: string): boolean {
    const sourceLower = source.toLowerCase();
    return CREDIBLE_SOURCES.some(credible =>
        sourceLower.includes(credible.toLowerCase())
    );
}

// Get source priority (lower = better)
function getSourcePriority(source: string): number {
    const sourceLower = source.toLowerCase();
    for (let i = 0; i < CREDIBLE_SOURCES.length; i++) {
        if (sourceLower.includes(CREDIBLE_SOURCES[i].toLowerCase())) {
            return i;
        }
    }
    return CREDIBLE_SOURCES.length; // Uncredible sources get lowest priority
}

export async function getGoogleNews(symbol: string) {
    try {
        const feed = await parser.parseURL(
            `https://news.google.com/rss/search?q=${encodeURIComponent(symbol)}+stock&hl=en-US&gl=US&ceid=US:en`
        );

        if (!feed.items || feed.items.length === 0) return [];

        const processedItems = feed.items
            .map(item => ({
                ...item,
                parsedDate: item.pubDate ? new Date(item.pubDate) : new Date(0),
                extractedSource: item.source?.toString() || extractSource(item.title || ""),
            }))
            .map(item => ({
                ...item,
                isCredible: isCredibleSource(item.extractedSource),
                priority: getSourcePriority(item.extractedSource)
            }))
            // Sort by: credible first, then by priority (wire services first), then by date
            .sort((a, b) => {
                if (a.isCredible !== b.isCredible) return a.isCredible ? -1 : 1;
                if (a.priority !== b.priority) return a.priority - b.priority;
                return b.parsedDate.getTime() - a.parsedDate.getTime();
            })
            .slice(0, 8);

        return processedItems.map(item => ({
            id: item.guid || Math.random().toString(),
            title: cleanHeadline(item.title || ""),
            summary: item.contentSnippet || item.title,
            source: item.extractedSource,
            timeAgo: formatRelativeTime(item.parsedDate),
            url: item.link
        }));
    } catch (error) {
        console.error("News RSS Error:", error);
        return [];
    }
}

function cleanHeadline(title: string) {
    return title.split(' - ')[0];
}

function extractSource(title: string) {
    const parts = title.split(' - ');
    return parts.length > 1 ? parts[parts.length - 1] : "Google News";
}

function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
        return `${diffMins}m ago`;
    } else if (diffHours < 24) {
        return `${diffHours}h ago`;
    } else if (diffDays < 7) {
        return `${diffDays}d ago`;
    } else {
        return date.toLocaleDateString();
    }
}
