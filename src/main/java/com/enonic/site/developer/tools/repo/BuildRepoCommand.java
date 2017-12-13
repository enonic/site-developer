package com.enonic.site.developer.tools.repo;

import java.util.Arrays;
import java.util.Map;

import org.asciidoctor.AsciiDocDirectoryWalker;
import org.asciidoctor.Asciidoctor;
import org.asciidoctor.Placement;
import org.jruby.RubyInstanceConfig;
import org.jruby.javasupport.JavaEmbedUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.enonic.xp.content.ContentService;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

import static org.asciidoctor.Asciidoctor.Factory.create;
import static org.asciidoctor.AttributesBuilder.attributes;
import static org.asciidoctor.OptionsBuilder.options;

public final class BuildRepoCommand
    implements ScriptBean
{
    private final static Logger LOGGER = LoggerFactory.getLogger( BuildRepoCommand.class );

    private String destination;

    private String repoName;

    private ContentService contentService;

    private BeanContext beanContext;

    public static void main( String[] args )
        throws Exception
    {

        final BuildRepoCommand buildRepoCommand = new BuildRepoCommand();
        buildRepoCommand.setDestination( "C:/Dev/Enonic/lib-xslt" );
        buildRepoCommand.setRepoName( "lib-xslt" );
        buildRepoCommand.execute();
    }


    public void execute()
        throws Exception
    {
        try
        {
            doExecute();
        }
        catch ( final Throwable t )
        {
            LOGGER.error( "Failed to build asciidoc in [" + repoName + "]", t );
            throw new RuntimeException( "Failed to build asciidoc in [" + repoName + "]", t );
        }
    }

    private void doExecute()
        throws Exception
    {
        RubyInstanceConfig config = new RubyInstanceConfig();
        config.setLoader( this.getClass().getClassLoader() );

        JavaEmbedUtils.initialize( Arrays.asList( "META-INF/jruby.home/lib/ruby/2.0", "gems/asciidoctor-1.5.6.1/lib" ), config );

        Asciidoctor asciidoctor = create( this.getClass().getClassLoader() );

        Map<String, Object> attributes = attributes().backend( "html5" ).icons( "font" ).setAnchors( true ).attribute( "sectlinks", true ).
            attribute( "encoding", "utf-8" ).linkAttrs( true ).attribute( "idprefix", "" ).
            attribute( "toclevels", 2 ).
            tableOfContents( Placement.RIGHT ).asMap();

        Map<String, Object> options = options().backend( "html5" ).attributes( attributes ).asMap();

        asciidoctor.convertDirectory( new AsciiDocDirectoryWalker( destination + "/docs" ), options );
    }

    public void setDestination( String destination )
    {
        this.destination = destination;
    }

    public void setRepoName( String repoName )
    {
        this.repoName = repoName;
    }

    @Override
    public void initialize( final BeanContext context )
    {
        this.beanContext = context;
        this.contentService = context.getService( ContentService.class ).get();
    }
}
