package com.enonic.site.developer.tools.doc;

import java.io.File;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class ExtractDocHtmlCommand
{
    private final static Logger LOGGER = LoggerFactory.getLogger( ExtractDocHtmlCommand.class );

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
        File input = new File( path );
        Document doc = Jsoup.parse( input, "UTF-8", "index.html" );
        final Element content = doExtract( doc );

        final ExtractedDoc result = new ExtractedDoc(content);

        return result;
    }

    private Element doExtract( final Document doc )
    {
        return doc.body().getElementById( "content" );
    }

    public void setPath( String path )
    {
        this.path = path;
    }
}
