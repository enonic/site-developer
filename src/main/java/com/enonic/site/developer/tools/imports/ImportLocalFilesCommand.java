package com.enonic.site.developer.tools.imports;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.regex.Pattern;

import org.jsoup.nodes.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.io.ByteSource;
import com.google.common.io.ByteStreams;

import com.enonic.site.developer.tools.doc.ExtractDocHtmlCommand;
import com.enonic.site.developer.tools.doc.ExtractedDoc;
import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.content.Content;
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

    private Path localPath;

    private String importPath;

    private String version;

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
            createDocVersion();
            importFoldersAndMedia();
            importDocpages(); // Loading docpages after all media that docpage may refer to is loaded
        }
        catch ( final Exception e )
        {
            LOGGER.error( "Failed to import data from [" + localPath + "]", e );
            throw new RuntimeException( "Failed to import data from [" + localPath + "]", e );
        }
    }

    private void createDocVersion()
    {
        if ( version == null || version.isEmpty() )
        {
            return;
        }

        final CreateContentParams createContentParams = CreateContentParams.create().
            contentData( new PropertyTree() ).
            displayName( version ).
            parent( ContentPath.from( importPath ) ).
            type( ContentTypeName.from( applicationKey + ":docversion" ) ).
            build();

        contentService.create( createContentParams );

        importPath = importPath + "/" + version;
    }

    private void importFoldersAndMedia()
        throws IOException
    {
        this.isRootFile = true;
        Files.walk( localPath ).filter( path -> !isRootFile() && !isForbidden( path ) && !isDocpage( path ) ).forEach(
            path -> createContent( path ) );
    }

    private void importDocpages()
        throws IOException
    {
        this.isRootFile = true;
        Files.walk( localPath ).filter( path -> !isRootFile() && !isForbidden( path ) && isDocpage( path ) ).forEach(
            path -> createDocpage( path ) );
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

    private boolean isForbidden( final Path path )
    {
        if ( path.endsWith( ".json" ) )
        {
            return true;
        }

        if ( path.endsWith( ".adoc" ) )
        {
            return true;
        }

        {
            return false;
        }
    }

    private boolean isDocpage( final Path path )
    {
        return path.getFileName().toString().equals( DEFAULT_DOCPAGE_NAME );
    }

    private void createContent( final Path path )
    {
        if ( Files.isDirectory( path ) )
        {
            createFolder( path );
        }
        else
        {
            createMedia( path );
        }
    }

    private ContentPath makeRepoPath( final Path path )
    {
        return ContentPath.from(
            importPath + ( importPath.endsWith( "/" ) ? "" : "/" ) + localPath.relativize( path ).toString().replace( "\\", "/" ) );
    }

    private void createFolder( final Path path )
    {
        final ContentPath repoPath = makeRepoPath( path );

        if ( contentService.contentExists( repoPath ) )
        {
            return;
        }

        LOGGER.info( "Creating folder " + repoPath );
        final CreateContentParams createContentParams = CreateContentParams.create().
            contentData( new PropertyTree() ).
            displayName( path.getFileName().toString() ).
            parent( repoPath.getParentPath() ).
            type( ContentTypeName.folder() ).
            build();
        contentService.create( createContentParams );
    }

    private void createDocpage( final Path path )
    {
        final ContentPath repoPath = makeRepoPath( path );

        if ( contentService.contentExists( repoPath ) )
        {
            return;
        }

        LOGGER.info( "Creating docpage " + repoPath );

        final ExtractDocHtmlCommand extractDocHtmlCommand = new ExtractDocHtmlCommand();
        extractDocHtmlCommand.setPath( path.toString() );
        final ExtractedDoc extractedDoc = extractDocHtmlCommand.execute();
        new UrlRewriter( "img", "src" ).rewrite( extractedDoc.getContent() );
        new UrlRewriter( "audio", "src" ).rewrite( extractedDoc.getContent() );
        new UrlRewriter( "video", "src" ).rewrite( extractedDoc.getContent() );

        final PropertyTree data = new PropertyTree();
        data.addString( "html", extractedDoc.getHtml() );
        data.addString( "title", extractedDoc.getTitle() );
        data.addString( "raw", extractedDoc.getText() );

        final CreateContentParams createContentParams = CreateContentParams.create().
            contentData( data ).
            displayName( path.getFileName().toString() ).
            parent( repoPath.getParentPath() ).
            type( ContentTypeName.from( applicationKey + ":docpage" ) ).
            requireValid( false ).
            build();
        contentService.create( createContentParams );
    }

    private void createMedia( final Path path )
    {
        final ContentPath repoPath = makeRepoPath( path );

        if ( contentService.contentExists( repoPath ) )
        {
            return;
        }

        LOGGER.info( "Creating media " + repoPath );
        final CreateMediaParams createMediaParams = new CreateMediaParams();
        createMediaParams.byteSource( loadMedia( path ) ).
            name( path.getFileName().toString() ).
            parent( repoPath.getParentPath() );

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
        this.localPath = new File( localPath ).toPath();
    }

    public void setImportPath( final String importPath )
    {
        this.importPath = importPath;
    }

    public void setVersion( final String version )
    {
        this.version = version;
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

    private final class UrlRewriter
    {
        private final Pattern URL_PATTERN = Pattern.compile( "(.+):(.+)" );

        private final String tag;

        private final String attr;

        private UrlRewriter( final String tag, final String attr )
        {
            this.tag = tag;
            this.attr = attr;
        }

        private void rewrite( final Element root )
        {
            for ( final Element e : root.select( this.tag ) )
            {
                final String href = e.attr( this.attr );
                if ( shouldRewriteUrl( href ) )
                {
                    e.attr( this.attr, rewriteUrl( href ) );
                }
            }
        }

        private boolean shouldRewriteUrl( final String url )
        {
            return !isNullOrEmpty( url ) && !URL_PATTERN.matcher( url ).matches();
        }

        private boolean isNullOrEmpty( final String value )
        {
            return ( value == null ) || value.equals( "" );
        }

        private String rewriteUrl( final String href )
        {
            final Content media = contentService.getByPath( ContentPath.from( importPath + "/" + href ) );

            return getMediaPrefix( media.getType() ) + media.getId();
        }
    }

    private String getMediaPrefix( final ContentTypeName contentTypeName )
    {
        if ( contentTypeName.isImageMedia() )
        {
            return "image://";
        }

        if ( contentTypeName.isAudioMedia() || contentTypeName.isVideoMedia() || contentTypeName.isUnknownMedia() )
        {
            return "media://";
        }

        return "";
    }

}


