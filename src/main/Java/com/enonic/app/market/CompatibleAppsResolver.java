package com.enonic.app.market;

import com.enonic.xp.content.FindContentIdsByQueryResult;

public interface CompatibleAppsResolver
{
    FindContentIdsByQueryResult resolve( final ListApplicationsParams params );
}
