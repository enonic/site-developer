package com.enonic.site.developer.tools.imports;

import java.io.File;
import java.io.FileInputStream;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.enonic.xp.content.Content;
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

    protected void initRootContent()
    {
        if ( label == null || label.isEmpty() )
        {
            rootContent = Optional.empty();
            return;
        }

        createOrUpdateDocversion();
    }

    private void createOrUpdateDocversion()
    {
        final ContentPath docVersionContentPath = ContentPath.from( importPath + "/" + label );

        if ( contentService.contentExists( docVersionContentPath ) )
        {
            updateDocversion( docVersionContentPath );
        }
        else
        {
            createDocversion();
        }

        importPath = importPath + "/" + label;
    }

    private void updateDocversion( final ContentPath docVersionContentPath )
    {
        final Content docVersion = updateContentWithCommitId( docVersionContentPath );
        rootContent = Optional.of( docVersion );
    }

    private void createDocversion()
    {
        LOGGER.info( "Creating docversion content [" + label + "]" );

        final PropertyTree data = new PropertyTree();
        data.addString( "commit", commit );

        final CreateContentParams createContentParams = CreateContentParams.create().
            contentData( data ).
            name( label ).
            displayName( label ).
            parent( ContentPath.from( importPath ) ).
            type( ContentTypeName.from( applicationKey + ":docversion" ) ).
            build();

        rootContent = Optional.of( contentService.create( createContentParams ) );
    }

    @Override
    protected void postProcess()
    {
        if ( rootContent.isPresent() )
        {
            try
            {
                importMenu();
            }
            catch ( Exception e )
            {
                LOGGER.error( "Failed to import [" + MENU_FILE_NAME + "] : ", e );
            }
        }
    }

    private void importMenu()
        throws Exception
    {
        final File menuFile = sourceDir.resolve( MENU_FILE_NAME ).toFile();

        if ( !menuFile.exists() )
        {
            LOGGER.info( "No [" + MENU_FILE_NAME + "] found." );
            return;
        }

        final String menu = new MenuHandler().getMenu( menuFile );

        addMenuToRootContent( menu );
    }

    private void addMenuToRootContent( final String menu )
    {
        final UpdateContentParams updateContentParams = new UpdateContentParams().
            contentId( rootContent.get().getId() ).
            editor( edit -> edit.data.setString( "menu", menu ) );

        contentService.update( updateContentParams );
    }

    public void setLabel( final String label )
    {
        this.label = label;
    }

    private final class MenuHandler
    {

        public String getMenu( final File menuFile )
            throws Exception
        {
            try (final FileInputStream menuInputStream = new FileInputStream( menuFile ))
            {
                final ObjectMapper mapper = new ObjectMapper();
                final MenuItem menuRoot = mapper.readValue( menuInputStream, MenuItem.class );
                processMenuUrls( menuRoot.getMenuItems() );

                return mapper.writeValueAsString( menuRoot );
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
                return rootContent.get().getId().toString();
            }

            final ContentPath contentPath = makeRepoPath( menuItemLocalPath );

            if ( !contentService.contentExists( contentPath ) )
            {
                return null;
            }

            return contentService.getByPath( contentPath ).getId().toString();
        }
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


