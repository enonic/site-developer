package com.enonic.site.developer.tools.doc;

import java.io.File;

import org.junit.Test;

import static org.junit.Assert.*;

public class HtmlExtractorCommandTest
{
    @Test
    public void testExtract()
        throws Exception
    {
        final ExtractedDoc extractedDoc = extractDoc( "index.html" );
        assertNotNull( extractedDoc );
        assertTrue( extractedDoc.getText().startsWith( "This library provides basic XSLT rendering functionality" ) );
        assertTrue( extractedDoc.getHtml().startsWith( "<div id=\"content\"> " ) );
    }

    private ExtractedDoc extractDoc( final String fileName )
        throws Exception
    {
        final HtmlExtractorCommand htmlExtractorCommand = new HtmlExtractorCommand();

        htmlExtractorCommand.setPath( getFilePath( fileName ) );

        return htmlExtractorCommand.execute();
    }

    private String getFilePath( final String fileName )
    {
        return new File( getClass().getResource( fileName ).getFile() ).getAbsolutePath();
    }
}
