package com.enonic.site.developer.tools.imports;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.enonic.xp.content.ContentPath;
import com.enonic.xp.content.CreateContentParams;
import com.enonic.xp.content.UpdateContentParams;
import com.enonic.xp.data.PropertyTree;
import com.enonic.xp.schema.content.ContentTypeName;

public final class ImportDocCommand
    extends ImportCommand
{
    private final static Logger LOGGER = LoggerFactory.getLogger( ImportDocCommand.class );

    private final static String MENU_FILE_NAME = "menu.json";

    private String label;

    private boolean isLatest;

    public static void main( String[] args )
    {
        final ImportDocCommand importDocCommand = new ImportDocCommand();
        importDocCommand.setSourceDir( "C:/Dev/Enonic/lib-xslt/docs/" );
        importDocCommand.setImportPath( "/developersite/doctest" );
        importDocCommand.rootDocContent = Optional.empty();
        importDocCommand.importMenu();
    }

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

    @Override
    protected void postProcess()
    {
        if ( rootDocContent.isPresent() )
        {
            importMenu();
        }
    }

    private void importMenu()
    {
        final Path filePath = sourceDir.resolve( MENU_FILE_NAME );

        if ( !filePath.toFile().exists() )
        {
            LOGGER.info( "No [" + MENU_FILE_NAME + "] found." );
            return;
        }

        try (final FileInputStream menuInputStream = new FileInputStream( filePath.toFile() ))
        {
            final ObjectMapper mapper = new ObjectMapper();
            final MenuItem menuRoot = mapper.readValue( menuInputStream, MenuItem.class );
            processMenuUrls( menuRoot.getMenuItems() );
            addMenuDataToRootDocContent( mapper.writeValueAsString( menuRoot ) );
        }
        catch ( final IOException e )
        {
            LOGGER.error( "Failed to import [" + MENU_FILE_NAME + "] : ", e );
        }
    }

    private void processMenuUrls( final List<MenuItem> menuItems )
    {
        for ( final MenuItem menuItem : menuItems )
        {
            menuItem.setContentId( generateMenuItemUrl( menuItem.getDocument() ) );
            processMenuUrls( menuItem.getMenuItems() );
        }
    }

    private String generateMenuItemUrl( final String documentPath )
    {
        final Path menuItemLocalPath = sourceDir.resolve( documentPath + ".html" );

        if ( isRootAsciiDoc( menuItemLocalPath ) )
        {
            return rootDocContent.get().getId().toString();
        }

        final ContentPath contentPath = makeRepoPath( menuItemLocalPath );

        if ( !contentService.contentExists( contentPath ) )
        {
            return null;
        }

        return contentService.getByPath( contentPath ).getId().toString();
    }

    private void addMenuDataToRootDocContent( final String menu )
    {
        final UpdateContentParams updateContentParams = new UpdateContentParams().
            contentId( rootDocContent.get().getId() ).
            editor( edit -> edit.data.setString( "menu", menu ) );

        contentService.update( updateContentParams );
    }

    public void setLabel( final String label )
    {
        this.label = label;
    }

    public void setIsLatest( final boolean isLatest )
    {
        this.isLatest = isLatest;
    }

    private static final class MenuItem
    {

        private String title;

        private String document;

        private String contentId;

        private List<MenuItem> menuItems = new ArrayList<>();

        public MenuItem()
        {
        }

        public String getTitle()
        {
            return title;
        }

        public void setTitle( final String title )
        {
            this.title = title;
        }

        public String getDocument()
        {
            return document;
        }

        public void setDocument( final String document )
        {
            this.document = document;
        }

        @JsonProperty
        public String getContentId()
        {
            return contentId;
        }

        @JsonIgnore
        public void setContentId( final String contentId )
        {
            this.contentId = contentId;
        }

        public List<MenuItem> getMenuItems()
        {
            return menuItems;
        }

        public void setMenuItems( final List<MenuItem> menuItems )
        {
            this.menuItems = menuItems;
        }
    }
}


