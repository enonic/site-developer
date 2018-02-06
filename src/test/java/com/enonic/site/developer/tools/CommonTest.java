package com.enonic.site.developer.tools;

import java.io.File;

public abstract class CommonTest
{
    protected String getPath( final String fileName )
    {
        return new File( getClass().getResource( fileName ).getFile() ).getAbsolutePath();
    }
}
