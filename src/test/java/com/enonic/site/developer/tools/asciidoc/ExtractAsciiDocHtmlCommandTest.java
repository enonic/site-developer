package com.enonic.site.developer.tools.asciidoc;

import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import com.enonic.site.developer.tools.CommonTest;

import static org.junit.Assert.*;

public class ExtractAsciiDocHtmlCommandTest
    extends CommonTest
{
    @Rule
    public ExpectedException exception = ExpectedException.none();

    @Test
    public void testExtract()
        throws Exception
    {
        final ExtractedDoc extractedDoc = extractDoc( getPath( "extract/index.html" ) );
        assertNotNull( extractedDoc );
        assertTrue( extractedDoc.getText().startsWith( "This library provides basic XSLT rendering functionality" ) );
        assertTrue( extractedDoc.getHtml().startsWith( "<div id=\"content\"> " ) );
        assertEquals( "XSLT Library", extractedDoc.getTitle() );
    }

    @Test
    public void testThrowsExceptionWhenPathIsBroken()
        throws Exception
    {
        exception.expect( RuntimeException.class );
        extractDoc( "some-broken-path" );
    }

    @Test
    public void testTitleIsNullWhenDocHasTitleUntitled()
        throws Exception
    {
        final ExtractedDoc extractedDoc = extractDoc( getPath( "extract/namesake.html" ) );
        assertNotNull( extractedDoc );
        assertNull( extractedDoc.getTitle() );
    }

    private ExtractedDoc extractDoc( final String filePath )
        throws Exception
    {
        final ExtractAsciiDocHtmlCommand extractAsciiDocHtmlCommand = new ExtractAsciiDocHtmlCommand();

        extractAsciiDocHtmlCommand.setPath( filePath );

        return extractAsciiDocHtmlCommand.execute();
    }
}
