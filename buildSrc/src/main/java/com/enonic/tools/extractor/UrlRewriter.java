package com.enonic.tools.extractor;

import java.util.regex.Pattern;

import org.jsoup.nodes.Element;

final class UrlRewriter
{
    private final static Pattern URL_PATTERN = Pattern.compile( "(.+):(.+)" );

    private final String tag;

    private final String attr;

    UrlRewriter( final String tag, final String attr )
    {
        this.tag = tag;
        this.attr = attr;
    }

    void rewrite( final Element root, final String baseUrl )
    {
        for ( final Element e : root.select( this.tag ) )
        {
            final String href = e.attr( this.attr );
            if ( shouldRewriteUrl( href ) )
            {
                e.attr( this.attr, rewriteUrl( baseUrl, href ) );
            }
        }
    }

    private boolean shouldRewriteUrl( final String url )
    {
        return !isNullOrEmpty( url ) && !URL_PATTERN.matcher( url ).matches();
    }

    private boolean isNullOrEmpty( final String value )
    {
        return ( value == null ) || value.equals( "" );
    }

    private String rewriteUrl( final String baseUrl, final String href )
    {
        return baseUrl + href;
    }
}
