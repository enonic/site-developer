package com.enonic.app.market;

import com.enonic.xp.content.ContentService;
import com.enonic.xp.content.Contents;
import com.enonic.xp.content.FindContentIdsByQueryResult;
import com.enonic.xp.content.GetContentByIdsParams;
import com.enonic.xp.lib.content.mapper.ContentsResultMapper;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public class MarketBean
    implements ScriptBean
{
    private CompatibleAppsResolver compatibleAppsResolver;

    private ContentService contentService;

    @Override
    public void initialize( final BeanContext context )
    {
        this.compatibleAppsResolver = context.getService( CompatibleAppsResolver.class ).get();
        this.contentService = context.getService( ContentService.class ).get();
    }

    @SuppressWarnings("unused")
    public Object listApplications( final ListApplicationsParams params )
    {
        final FindContentIdsByQueryResult result = this.compatibleAppsResolver.resolve( params );
        final Contents applications = this.contentService.getByIds( new GetContentByIdsParams( result.getContentIds() ) );
        return new ContentsResultMapper( applications, result.getTotalHits() );
    }
}
