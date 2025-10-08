import Head from 'next/head';

export interface ISeoMetaHeadProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    item?: any;
    imageUrl?: string;
    pageTitle?: string;
    keywords?: string | Array<string>;
    description?: string;
    metaTitle?: string;
    canonicalUrl?: string;
    h1?: string;
    wordCount?: number;
}
function SeoMetaHead({
    item = null,
    imageUrl = '',
    pageTitle = '',
    keywords = '',
    description = '',
    canonicalUrl = '',
    h1 = '',
    wordCount = 0
}: ISeoMetaHeadProps) {
    const siteName = 'CodeSnippet';
    let metaKeywords = keywords;
    if (Array.isArray(keywords)) metaKeywords = keywords.join(',');

    return (
        <Head>
            <title>{pageTitle}</title>

            <meta name="description" content={description} />
            {canonicalUrl && <meta property="canonical" content={canonicalUrl} />}

            <meta property="og:site_name" content={siteName} />
            <meta property="og:type" content="profile" />
            {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
            <meta property="og:description" content={description || siteName} />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:image" content={imageUrl || '/favicon.ico'} />
            <meta property="og:image:alt" content={`${item?.username || siteName} thumb`} />
            <meta property="og:image:width" content="800" />
            <meta property="og:image:height" content="354" />
            <meta property="og:image:type" content="image/jpeg" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:image" content={imageUrl || '/favicon.ico'} />
            <meta name="twitter:description" content={description || siteName} />
            <meta name="twitter:site" content={`@${item?.username || 'default_username'}`} />
            <meta name="twitter:creator" content={`@${item?.username || 'default_username'}`} />
            {canonicalUrl && <meta name="twitter:url" content={canonicalUrl} />}
            {/* {mTitle && <meta name="twitter:title" content={truncate(mTitle, { length: 70 })} />} */}
            {item?.username && <meta name="twitter:image:alt" content={`Profile thumb ${item.username}`} />}
            {h1 && <meta property="custom:h1" content={h1} />}
            {wordCount && <meta property="custom:wordCount" content={wordCount.toString()} />}
            {metaKeywords && <meta name="keywords" content={metaKeywords as string} />}
        </Head>
    );
}

export default SeoMetaHead;
