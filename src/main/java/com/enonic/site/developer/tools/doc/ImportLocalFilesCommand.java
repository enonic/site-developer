package com.enonic.site.developer.tools.doc;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.io.ByteSource;
import com.google.common.io.ByteStreams;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.content.ContentConstants;
import com.enonic.xp.content.ContentPath;
import com.enonic.xp.content.ContentService;
import com.enonic.xp.content.CreateContentParams;
import com.enonic.xp.content.CreateMediaParams;
import com.enonic.xp.context.ContextBuilder;
import com.enonic.xp.data.PropertyTree;
import com.enonic.xp.schema.content.ContentTypeName;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;
import com.enonic.xp.security.PrincipalKey;
import com.enonic.xp.security.RoleKeys;
import com.enonic.xp.security.User;
import com.enonic.xp.security.UserStoreKey;
import com.enonic.xp.security.auth.AuthenticationInfo;

public final class ImportLocalFilesCommand
    implements ScriptBean
{
    private final static Logger LOGGER = LoggerFactory.getLogger( ImportLocalFilesCommand.class );

    private static final String DEFAULT_DOCPAGE_NAME = "index.html";

    private static final User SUPER_USER = User.create().
        key( PrincipalKey.ofUser( UserStoreKey.system(), "su" ) ).
        login( "su" ).
        build();

    private String localPath;

    private String importPath;

    private ApplicationKey applicationKey;

    private ContentService contentService;

    private boolean isRootFile = true;

    public void execute()
        throws Exception
    {
        runAsAdmin( this::doExecute );
    }

    public void doExecute()
    {
        try
        {
            final Path sourcePath = new File( localPath ).toPath();
            Files.walk( sourcePath ).filter( path -> !this.isRootFile() ).forEach( path -> this.createContent( sourcePath, path ) );
        }
        catch ( final Exception e )
        {
            LOGGER.error( "Failed to import data from [" + localPath + "]", e );
            throw new RuntimeException( "Failed to import data from [" + localPath + "]", e );
        }
    }

    private boolean isRootFile()
    {
        if ( isRootFile )
        {
            isRootFile = false;
            return true;
        }

        return false;
    }

    private void createContent( final Path sourcePath, final Path path )
    {
        final ContentPath parentRepoPath = makeParentRepoPath( sourcePath.relativize( path ) );

        if ( contentService.contentExists( ContentPath.from( parentRepoPath, path.getFileName().toString() ) ) )
        {
            return;
        }

        if ( Files.isDirectory( path ) )
        {
            createFolder( parentRepoPath, path );
        }
        else if ( path.getFileName().toString().equals( DEFAULT_DOCPAGE_NAME ) )
        {
            createDocpage( parentRepoPath, path );
        }
        else
        {
            createMedia( parentRepoPath, path );
        }

    }

    private ContentPath makeParentRepoPath( final Path path )
    {
        return ContentPath.from( importPath + ( importPath.endsWith( "/" ) ? "" : "/" ) +
                                     ( path.getParent() == null ? "" : path.getParent().toString().replace( "\\", "/" ) + "/" ) );
    }

    private void createFolder( final ContentPath parentRepoPath, final Path path )
    {
        LOGGER.info( "Creating folder " + parentRepoPath + path.getFileName() );
        final CreateContentParams createContentParams = CreateContentParams.create().
            contentData( new PropertyTree() ).
            displayName( path.getFileName().toString() ).
            parent( parentRepoPath ).
            type( ContentTypeName.folder() ).
            build();
        contentService.create( createContentParams );
    }

    private void createDocpage( final ContentPath parentRepoPath, final Path filePath )
    {
        LOGGER.info( "Creating docpage " + parentRepoPath + filePath.getFileName() );

        final HtmlExtractorCommand htmlExtractorCommand = new HtmlExtractorCommand();
        htmlExtractorCommand.setPath( filePath.toString() );

        final PropertyTree data = new PropertyTree();
        data.addString( "html", htmlExtractorCommand.execute().getHtml() );

        final CreateContentParams createContentParams = CreateContentParams.create().
            contentData( data ).
            displayName( filePath.getFileName().toString() ).
            parent( parentRepoPath ).
            type( ContentTypeName.from( applicationKey + ":docpage" ) ).
            build();
        contentService.create( createContentParams );
    }

    private void createMedia( final ContentPath parentRepoPath, final Path filePath )
    {
        LOGGER.info( "Creating media " + parentRepoPath + filePath.getFileName() );
        final CreateMediaParams createMediaParams = new CreateMediaParams();
        createMediaParams.byteSource( loadMedia( filePath ) ).
            name( filePath.getFileName().toString() ).
            parent( parentRepoPath );

        contentService.create( createMediaParams );
    }

    protected ByteSource loadMedia( final Path filePath )
    {
        try
        {
            final InputStream imageStream = new FileInputStream( filePath.toFile() );

            return ByteSource.wrap( ByteStreams.toByteArray( imageStream ) );
        }
        catch ( IOException e )
        {
            throw new RuntimeException( "Failed to read local file " + filePath, e );
        }
    }

    public void setLocalPath( final String localPath )
    {
        this.localPath = localPath;
    }

    public void setImportPath( final String importPath )
    {
        this.importPath = importPath;
    }

    private void runAsAdmin( final Runnable runnable )
    {
        ContextBuilder.from( ContentConstants.CONTEXT_DRAFT ).
            authInfo( createAdminAuthInfo() ).
            build().
            runWith( runnable );
    }

    private AuthenticationInfo createAdminAuthInfo()
    {
        return AuthenticationInfo.create().
            principals( RoleKeys.ADMIN ).
            user( SUPER_USER ).
            build();
    }

    @Override
    public void initialize( final BeanContext context )
    {
        this.contentService = context.getService( ContentService.class ).get();
        this.applicationKey = context.getApplicationKey();
    }
}


