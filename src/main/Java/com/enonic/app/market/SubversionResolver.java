package com.enonic.app.market;

import java.util.Set;

public interface SubversionResolver
{
    Set<Version> resolve( final Version version, final String versionFieldName );

}
