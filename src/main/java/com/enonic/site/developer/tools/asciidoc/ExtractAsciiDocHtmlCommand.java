package com.enonic.site.developer.tools.asciidoc;

import java.io.File;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class ExtractAsciiDocHtmlCommand
{
    private final static Logger LOGGER = LoggerFactory.getLogger( ExtractAsciiDocHtmlCommand.class );

    private final static String DEFAULT_CHARSET = "UTF-8";

    private final static String UNTITLED = "Untitled";

    private final static String CONTENT_ELEM_ID = "content";

    private String path;

    public ExtractedDoc execute()
    {
        try
        {
            return doExtract();
        }
        catch ( final Exception e )
        {
            LOGGER.error( "Failed to fetch [" + path + "]", e );
            throw new RuntimeException( "Failed to fetch [" + path + "]", e );
        }
    }

    private ExtractedDoc doExtract()
        throws Exception
    {
        final File input = new File( path );
        final Document doc = Jsoup.parse( input, DEFAULT_CHARSET );
        final Element content = doExtract( doc );
        final Element title = doc.select( "head title" ).first();

        if ( isUntitled( title ) )
        {
            return new ExtractedDoc( content );
        }

        return new ExtractedDoc( content, title.ownText() );
    }

    private boolean isUntitled( final Element title )
    {
        return title == null || title.ownText().trim().isEmpty() || title.ownText().trim().equals( UNTITLED );
    }

    private Element doExtract( final Document doc )
    {
        return doc.body().getElementById( CONTENT_ELEM_ID );
    }

    public void setPath( String path )
    {
        this.path = path;
    }
}
