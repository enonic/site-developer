package com.enonic.tools.extractor;

import java.util.ArrayList;
import java.util.List;

import org.gradle.api.GradleException;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

public final class ExtractorService
{
    private final List<UrlRewriter> rewriters;

    public ExtractorService()
    {
        this.rewriters = new ArrayList<>();
        this.rewriters.add( new UrlRewriter( "img", "src" ) );
    }

    public ExtractedDoc getHtml( final String baseUrl )
    {
        final String url = baseUrl.endsWith(".html") ? baseUrl : baseUrl + "/index.html";

        try
        {
            return doExtract( baseUrl, url );
        }
        catch ( final Exception e )
        {
            throw new GradleException( "Failed to fetch [" + url + "]", e );
        }
    }

    private ExtractedDoc doExtract( final String baseUrl, final String url )
        throws Exception
    {
        final Document doc = Jsoup.connect( url ).get();
        final Element content = doExtract( doc );

        rewriteUrls( content, baseUrl );

        final ExtractedDoc result = new ExtractedDoc();
        result.setHtml( content.toString() );
        result.setText( content.text() );
        return result;
    }

    private Element doExtract( final Document doc )
    {
        return doc.body().getElementById( "content" );
    }

    private void rewriteUrls( final Element element, final String baseUrl )
    {
        for ( final UrlRewriter rewriter : this.rewriters )
        {
            rewriter.rewrite( element, baseUrl );
        }
    }
}
