package com.enonic.site.developer.tools.imports;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.enonic.xp.content.ContentPath;
import com.enonic.xp.content.CreateContentParams;
import com.enonic.xp.data.PropertyTree;
import com.enonic.xp.schema.content.ContentTypeName;

public final class ImportDocCommand
    extends ImportCommand
{
    private final static Logger LOGGER = LoggerFactory.getLogger( ImportDocCommand.class );

    private String label;

    private boolean isLatest;

    protected void initRootDocContent()
    {
        if ( label == null || label.isEmpty() )
        {
            rootDocContent = Optional.empty();
            return;
        }

        LOGGER.info( "Creating docversion content [" + label + "]" );

        final PropertyTree data = new PropertyTree();
        data.addBoolean( "isLatest", isLatest );

        final CreateContentParams createContentParams = CreateContentParams.create().
            contentData( data ).
            name( label ).
            displayName( label ).
            parent( ContentPath.from( importPath ) ).
            type( ContentTypeName.from( applicationKey + ":docversion" ) ).
            build();

        rootDocContent = Optional.of( contentService.create( createContentParams ) );

        importPath = importPath + "/" + label;
    }

    public void setLabel( final String label )
    {
        this.label = label;
    }

    public void setIsLatest( final boolean isLatest )
    {
        this.isLatest = isLatest;
    }
}


