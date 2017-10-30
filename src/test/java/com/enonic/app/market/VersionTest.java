package com.enonic.app.market;

import org.junit.Test;

import static org.junit.Assert.*;

public class VersionTest
{

    @Test
    public void create()
        throws Exception
    {
        final Version from = Version.from( "1.2.3" );
        assertEquals( (Integer) 1, from.getMajor() );
        assertEquals( (Integer) 2, from.getMinor() );
        assertEquals( (Integer) 3, from.getPatch() );
    }

    @Test
    public void major_only()
        throws Exception
    {
        final Version from = Version.from( "1" );
        assertEquals( (Integer) 1, from.getMajor() );
        assertEquals( (Integer) 0, from.getMinor() );
        assertEquals( (Integer) 0, from.getPatch() );
    }


    @Test
    public void higher_major()
        throws Exception
    {
        final Version version = Version.from( "7.0.0" );
        assertFalse( version.isCompatible( Version.from( "6.6.0" ) ) );
    }

    @Test
    public void higher_minor_same_patch()
        throws Exception
    {
        final Version version = Version.from( "6.8.6" );
        assertTrue( version.isCompatible( Version.from( "6.7.6" ) ) );
    }

    @Test
    public void higher_minor_patch_lower()
        throws Exception
    {
        final Version version = Version.from( "6.6.0" );
        assertTrue( version.isCompatible( Version.from( "6.4.2" ) ) );
    }

    @Test
    public void same_minor_patch_lower()
        throws Exception
    {
        final Version version = Version.from( "6.6.0" );
        assertFalse( version.isCompatible( Version.from( "6.6.2" ) ) );
    }

    @Test
    public void same_minor_patch_equals()
        throws Exception
    {
        final Version version = Version.from( "6.6.2" );
        assertTrue( version.isCompatible( Version.from( "6.6.2" ) ) );
    }

    @Test
    public void same_minor_patch_higher()
        throws Exception
    {
        final Version version = Version.from( "6.6.3" );
        assertTrue( version.isCompatible( Version.from( "6.6.2" ) ) );
    }

}