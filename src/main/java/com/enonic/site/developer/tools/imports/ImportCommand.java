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
import org.apache.commons.lang.StringUtils;
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
import com.enonic.xp.content.ContentNotFoundException;
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

    protected Optional<Content> rootContent;

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
            initRootContent();
            importData();
            postProcess();
        }
        catch ( final Exception e )
        {
            LOGGER.error( "Failed to import data from [" + sourceDir + "]", e );
            throw new RuntimeException( "Failed to import data from [" + sourceDir + "]", e );
        }
    }

    protected abstract void initRootContent();

    private void importData()
        throws Exception
    {
        createContents();
        importAsciiDocs();
    }

    private void createContents()
        throws IOException
    {
        Files.walk( sourceDir ).filter( path -> !isForbidden( path ) ).forEach( path -> createContent( path ) );
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
        else if ( isCompiledAsciiDoc( path ) )
        {
            createEmptyDocpage( path );
        }
        else
        {
            createMedia( path );
        }
    }

    private boolean isCompiledAsciiDoc( final Path path )
    {
        return path.getFileName().toString().endsWith( ".html" );
    }

    private boolean isAsciiDocNameSakePresent( final Path path )
    {
        return new File( path.toString() + ".html" ).exists();
    }

    private void createEmptyDocpage( final Path path )
    {
        if ( isRootAsciiDoc( path ) )
        {
            return;
        }

        final ContentPath repoPath = makeRepoPath( path );

        if ( contentService.contentExists( repoPath ) )
        {
            return;
        }

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

    protected final boolean isRootAsciiDoc( final Path path )
    {
        return rootContent.isPresent() && path.getParent().equals( sourceDir ) &&
            path.getFileName().toString().equals( DEFAULT_ASCIIDOC_NAME );
    }

    private void importAsciiDoc( final Path asciiDocPath )
    {
        final Content content = getContentToImportAsciiDocTo( asciiDocPath );
        final ExtractedDoc asciiDoc = getAsciiDoc( asciiDocPath );
        final String displayName = ( StringUtils.isEmpty( asciiDoc.getTitle() ) || isRootAsciiDoc( asciiDocPath ) )
            ? content.getDisplayName()
            : asciiDoc.getTitle();

        LOGGER.info( "Imorting asciidoc into " + content.getPath() );
        final UpdateContentParams updateContentParams = new UpdateContentParams().
            contentId( content.getId() ).
            editor( edit -> {
                edit.displayName = displayName;
                edit.data.setString( "html", asciiDoc.getHtml() );
                edit.data.setString( "title", asciiDoc.getTitle() );
                edit.data.setString( "raw", asciiDoc.getText() );
            } );

        contentService.update( updateContentParams );
    }

    private Content getContentToImportAsciiDocTo( final Path path )
    {
        if ( isRootAsciiDoc( path ) )
        {
            return rootContent.get();
        }

        return contentService.getByPath( makeRepoPath( path ) );
    }

    private ExtractedDoc getAsciiDoc( final Path path )
    {
        final ExtractedDoc extractedDoc = extractAsciiDoc( path );

        processAsciiDocContent( extractedDoc, path );

        return extractedDoc;
    }

    private ExtractedDoc extractAsciiDoc( final Path path )
    {
        final ExtractAsciiDocHtmlCommand extractAsciiDocHtmlCommand = new ExtractAsciiDocHtmlCommand();
        extractAsciiDocHtmlCommand.setPath( path.toString() );
        return extractAsciiDocHtmlCommand.execute();
    }

    private void processAsciiDocContent( final ExtractedDoc extractedDoc, final Path path )
    {
        new UrlRewriter( path, "img", "src" ).rewrite( extractedDoc.getContent() );
        new UrlRewriter( path, "audio", "src" ).rewrite( extractedDoc.getContent() );
        new UrlRewriter( path, "video", "src" ).rewrite( extractedDoc.getContent() );
        new DocpageUrlRewriter( path, "a", "href" ).rewrite( extractedDoc.getContent() );
        new YoutubeWrapper().wrap( extractedDoc.getContent() );
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
        this.sourceDir = new File( sourceDir ).toPath().normalize().toAbsolutePath();
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
        private static final String MEDIA_LINK = "media://";

        private static final String IMAGE_LINK = "image://";

        protected final Pattern URL_PATTERN = Pattern.compile( "(.+):(.+)" );

        protected final String tag;

        protected final String attr;

        protected final Path path;

        private UrlRewriter( final Path path, final String tag, final String attr )
        {
            this.path = path;
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
            try
            {
                final Path resolvedPath = resolveLink( href );
                final Content content = getContentByPath( resolvedPath );
                return getPrefix( content.getType() ) + content.getId();
            }
            catch ( final ContentNotFoundException e )
            {
                LOGGER.warn( "Unable to resolve link '" + href + "'" );
            }

            return href;
        }

        protected Path resolveLink( final String href )
        {
            return path.getParent().resolve( href ).normalize();
        }

        protected Content getContentByPath( final Path path )
        {
            return contentService.getByPath( makeRepoPath( path ) );
        }

        protected String getPrefix( final ContentTypeName contentTypeName )
        {
            if ( contentTypeName.isImageMedia() )
            {
                return IMAGE_LINK;
            }

            if ( contentTypeName.isAudioMedia() || contentTypeName.isVideoMedia() || contentTypeName.isUnknownMedia() )
            {
                return MEDIA_LINK;
            }

            return "";
        }
    }

    private final class DocpageUrlRewriter
        extends UrlRewriter
    {
        private static final String CONTENT_LINK = "content://";

        private DocpageUrlRewriter( final Path path, final String tag, final String attr )
        {
            super( path, tag, attr );
        }

        protected boolean shouldRewriteUrl( final String url )
        {
            return super.shouldRewriteUrl( url ) && url.endsWith( ".html" );
        }

        protected Content getContentByPath( final Path path )
        {
            if ( isRootAsciiDoc( path ) )
            {
                return rootContent.get();
            }

            return super.getContentByPath( path );
        }

        protected String getPrefix( final ContentTypeName contentTypeName )
        {
            return CONTENT_LINK;
        }
    }

    private final class YoutubeWrapper
    {
        private static final String IFRAME_TAG = "iframe";

        private static final String SRC_ATTR = "src";

        public void wrap( final Element root )
        {
            for ( final Element e : root.select( IFRAME_TAG ) )
            {
                final String src = e.attr( SRC_ATTR );

                if ( isLinkToYoutube( src ) )
                {
                    updateParent( e );
                }
            }
        }

        private boolean isLinkToYoutube( final String link )
        {
            if ( link == null )
            {
                return false;
            }

            return link.contains( "www.youtube." );
        }

        private void updateParent( final Element e )
        {
            final Element parent = e.parent();

            if ( parent == null )
            {
                return;
            }

            parent.addClass( "youtube-wrapper" );
        }

    }
}
