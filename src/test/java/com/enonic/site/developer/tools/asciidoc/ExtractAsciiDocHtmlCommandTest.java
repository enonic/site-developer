package com.enonic.site.developer.tools.asciidoc;

import java.io.File;

import org.junit.Test;

import static org.junit.Assert.*;

public class ExtractAsciiDocHtmlCommandTest
{
    @Test
    public void testExtract()
        throws Exception
    {
        final ExtractedDoc extractedDoc = extractDoc( "index.html" );
        assertNotNull( extractedDoc );
        assertTrue( extractedDoc.getText().startsWith( "This library provides basic XSLT rendering functionality" ) );
        assertTrue( extractedDoc.getHtml().startsWith( "<div id=\"content\"> " ) );
        assertEquals( "XSLT Library",extractedDoc.getTitle() );
    }

    private ExtractedDoc extractDoc( final String fileName )
        throws Exception
    {
        final ExtractAsciiDocHtmlCommand extractAsciiDocHtmlCommand = new ExtractAsciiDocHtmlCommand();

        extractAsciiDocHtmlCommand.setPath( getFilePath( fileName ) );

        return extractAsciiDocHtmlCommand.execute();
    }

    private String getFilePath( final String fileName )
    {
        return new File( getClass().getResource( fileName ).getFile() ).getAbsolutePath();
    }
}
