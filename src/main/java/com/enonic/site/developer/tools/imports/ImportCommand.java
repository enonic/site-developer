package com.enonic.site.developer.tools.imports;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;
import java.util.regex.Pattern;

import org.apache.commons.io.FilenameUtils;
import org.jsoup.nodes.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.io.ByteSource;
import com.google.common.io.ByteStreams;

import com.enonic.site.developer.tools.asciidoc.ExtractAsciiDocHtmlCommand;
import com.enonic.site.developer.tools.asciidoc.ExtractedDoc;
import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.content.Content;
import com.enonic.xp.content.ContentConstants;
import com.enonic.xp.content.ContentId;
import com.enonic.xp.content.ContentPath;
import com.enonic.xp.content.ContentService;
import com.enonic.xp.content.CreateContentParams;
import com.enonic.xp.content.CreateMediaParams;
import com.enonic.xp.content.UpdateContentParams;
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

public abstract class ImportCommand
    implements ScriptBean
{
    protected static final String DEFAULT_ASCIIDOC_NAME = "index.html";

    private final static Logger LOGGER = LoggerFactory.getLogger( ImportCommand.class );

    private static final User SUPER_USER = User.create().
        key( PrincipalKey.ofUser( UserStoreKey.system(), "su" ) ).
        login( "su" ).
        build();

    protected Path sourceDir;

    protected String importPath;

    protected Optional<Content> rootDocContent;

    protected ApplicationKey applicationKey;

    protected ContentService contentService;

    public final void execute()
        throws Exception
    {
        runAsAdmin( this::doExecute );
    }

    private void doExecute()
    {
        try
        {
            initRootDocContent();
            importData();
            postProcess();
        }
        catch ( final Exception e )
        {
            LOGGER.error( "Failed to import data from [" + sourceDir + "]", e );
            throw new RuntimeException( "Failed to import data from [" + sourceDir + "]", e );
        }
    }

    protected abstract void initRootDocContent();

    private void importData()
        throws Exception
    {
        importFoldersAndMedia();
        importAsciiDocs();
    }

    private void importFoldersAndMedia()
        throws IOException
    {
        Files.walk( sourceDir ).filter( path -> !isForbidden( path ) && !isCompiledAsciiDoc( path ) ).forEach(
            path -> createContent( path ) );
    }

    private boolean isForbidden( final Path path )
    {
        if ( path.equals( sourceDir ) )
        {
            return true;
        }

        if ( path.toString().endsWith( ".json" ) )
        {
            return true;
        }

        if ( path.toString().endsWith( ".adoc" ) )
        {
            return true;
        }

        {
            return false;
        }
    }

    private boolean isCompiledAsciiDoc( final Path path )
    {
        return path.getFileName().toString().endsWith( ".html" );
    }

    private void createContent( final Path path )
    {
        if ( Files.isDirectory( path ) )
        {
            if ( isAsciiDocNameSakePresent( path ) )
            {
                createEmptyDocpage( path );
            }
            else
            {
                createFolder( path );
            }
        }
        else
        {
            createMedia( path );
        }
    }

    private boolean isAsciiDocNameSakePresent( final Path path )
    {
        return new File( path.toString() + ".html" ).exists();
    }

    private void createEmptyDocpage( final Path path )
    {
        final ContentPath repoPath = makeRepoPath( path );

        LOGGER.info( "Creating empty docpage " + repoPath );

        final String name = FilenameUtils.getBaseName( path.getFileName().toString() );

        final CreateContentParams createContentParams = CreateContentParams.create().
            contentData( new PropertyTree() ).
            name( name ).
            displayName( name ).
            parent( repoPath.getParentPath() ).
            type( ContentTypeName.from( applicationKey + ":docpage" ) ).
            requireValid( false ).
            build();
        contentService.create( createContentParams );
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
            name( path.getFileName().toString() ).
            displayName( path.getFileName().toString() ).
            parent( repoPath.getParentPath() ).
            type( ContentTypeName.folder() ).
            build();
        contentService.create( createContentParams );
    }

    protected final ContentPath makeRepoPath( final Path path )
    {
        return ContentPath.from( importPath + ( importPath.endsWith( "/" ) ? "" : "/" ) +
                                     sourceDir.relativize( path ).toString().replace( "\\", "/" ).replace( ".html", "" ) );
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

    private ByteSource loadMedia( final Path filePath )
    {
        try (final InputStream imageStream = new FileInputStream( filePath.toFile() ))
        {
            return ByteSource.wrap( ByteStreams.toByteArray( imageStream ) );
        }
        catch ( IOException e )
        {
            throw new RuntimeException( "Failed to read local file " + filePath, e );
        }
    }

    private void importAsciiDocs()
        throws IOException
    {
        Files.walk( sourceDir ).filter( this::isCompiledAsciiDoc ).forEach( this::importAsciiDoc );
    }

    private void importAsciiDoc( final Path path )
    {
        if ( isRootAsciiDoc( path ) && rootDocContent.isPresent() )
        {
            updateContentWithAsciiDoc( path, rootDocContent.get().getId() );
        }
        else
        {
            createOrUpdateDocpage( path );
        }
    }

    protected final boolean isRootAsciiDoc( final Path path )
    {
        return path.getParent().equals( sourceDir ) && path.getFileName().toString().equals( DEFAULT_ASCIIDOC_NAME );
    }

    private void updateContentWithAsciiDoc( final Path asciiDocPath, final ContentId contentId )
    {
        final ExtractedDoc asciiDoc = getAsciiDoc( asciiDocPath );

        final UpdateContentParams updateContentParams = new UpdateContentParams().
            contentId( contentId ).
            editor( edit -> {
                edit.data.setString( "html", asciiDoc.getHtml() );
                edit.data.setString( "title", asciiDoc.getTitle() );
                edit.data.setString( "raw", asciiDoc.getText() );
            } );

        contentService.update( updateContentParams );
    }

    private ExtractedDoc getAsciiDoc( final Path path )
    {
        final ExtractAsciiDocHtmlCommand extractAsciiDocHtmlCommand = new ExtractAsciiDocHtmlCommand();
        extractAsciiDocHtmlCommand.setPath( path.toString() );
        final ExtractedDoc extractedDoc = extractAsciiDocHtmlCommand.execute();

        new UrlRewriter( "img", "src" ).rewrite( extractedDoc.getContent() );
        new UrlRewriter( "audio", "src" ).rewrite( extractedDoc.getContent() );
        new UrlRewriter( "video", "src" ).rewrite( extractedDoc.getContent() );
        new DocpageUrlRewriter( "a", "href", isRootAsciiDoc( path ) ).rewrite( extractedDoc.getContent() );

        return extractedDoc;
    }

    private void createOrUpdateDocpage( final Path path )
    {
        final ContentPath repoPath = makeRepoPath( path );

        if ( contentService.contentExists( repoPath ) )
        {
            LOGGER.info( "Updating docpage " + repoPath );
            final Content docpage = contentService.getByPath( repoPath );
            updateContentWithAsciiDoc( path, docpage.getId() );
            return;
        }

        LOGGER.info( "Creating docpage " + repoPath );

        final ExtractedDoc asciiDoc = getAsciiDoc( path );

        final PropertyTree data = new PropertyTree();
        data.addString( "html", asciiDoc.getHtml() );
        data.addString( "title", asciiDoc.getTitle() );
        data.addString( "raw", asciiDoc.getText() );

        final String name = FilenameUtils.getBaseName( path.getFileName().toString() );

        final CreateContentParams createContentParams = CreateContentParams.create().
            contentData( data ).
            name( name ).
            displayName( name ).
            parent( repoPath.getParentPath() ).
            type( ContentTypeName.from( applicationKey + ":docpage" ) ).
            requireValid( false ).
            build();
        contentService.create( createContentParams );
    }

    protected void postProcess()
    {

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

    public void setSourceDir( final String sourceDir )
    {
        this.sourceDir = new File( sourceDir ).toPath();
    }

    public void setImportPath( final String importPath )
    {
        this.importPath = importPath;
    }

    @Override
    public void initialize( final BeanContext context )
    {
        this.contentService = context.getService( ContentService.class ).get();
        this.applicationKey = context.getApplicationKey();
    }

    private class UrlRewriter
    {
        protected final Pattern URL_PATTERN = Pattern.compile( "(.+):(.+)" );

        protected final String tag;

        protected final String attr;

        private UrlRewriter( final String tag, final String attr )
        {
            this.tag = tag;
            this.attr = attr;
        }

        protected void rewrite( final Element root )
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

        protected boolean shouldRewriteUrl( final String url )
        {
            return !isNullOrEmpty( url ) && !URL_PATTERN.matcher( url ).matches();
        }

        private boolean isNullOrEmpty( final String value )
        {
            return ( value == null ) || value.equals( "" );
        }

        protected String rewriteUrl( final String href )
        {
            final Content media = contentService.getByPath( ContentPath.from( importPath + "/" + href ) );

            return getMediaPrefix( media.getType() ) + media.getId();
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

    private final class DocpageUrlRewriter
        extends UrlRewriter
    {
        private final boolean isRootDoc;

        private DocpageUrlRewriter( final String tag, final String attr, final boolean isRootDoc )
        {
            super( tag, attr );
            this.isRootDoc = isRootDoc;
        }

        protected boolean shouldRewriteUrl( final String url )
        {
            return super.shouldRewriteUrl( url ) && url.endsWith( ".html" );
        }

        protected String rewriteUrl( final String href )
        {
            if ( isRootDoc )
            {
                return rootDocContent.get().getName() + "/" + href.replace( ".html", "" );
            }

            return href.replace( DEFAULT_ASCIIDOC_NAME, "." ).replace( ".html", "" );
        }
    }
}
