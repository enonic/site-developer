package com.enonic.site.developer.tools.asciidoc;

import java.util.Arrays;

import org.asciidoctor.AsciiDocDirectoryWalker;
import org.asciidoctor.Asciidoctor;
import org.asciidoctor.Attributes;
import org.asciidoctor.Options;
import org.asciidoctor.Placement;
import org.jruby.RubyInstanceConfig;
import org.jruby.javasupport.JavaEmbedUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static org.asciidoctor.Asciidoctor.Factory.create;
import static org.asciidoctor.AttributesBuilder.attributes;
import static org.asciidoctor.OptionsBuilder.options;

public final class BuildAsciiDocCommand
{
    private final static Logger LOGGER = LoggerFactory.getLogger( BuildAsciiDocCommand.class );

    private String repoName;

    private String sourceDir;

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
        final Asciidoctor asciidoctor = createAsciidoctor();
        asciidoctor.convertDirectory( new AsciiDocDirectoryWalker( sourceDir ), createOptions() );
        asciidoctor.shutdown();
    }

    private Asciidoctor createAsciidoctor()
    {
        final RubyInstanceConfig config = new RubyInstanceConfig();
        config.setLoader( this.getClass().getClassLoader() );

        JavaEmbedUtils.initialize( Arrays.asList( "META-INF/jruby.home/lib/ruby/2.0", "gems/asciidoctor-1.5.6.1/lib" ), config );

        final Asciidoctor asciidoctor = create( this.getClass().getClassLoader() );

        return asciidoctor;
    }

    private Options createOptions()
    {
        Attributes attributes = attributes().backend( "html5" ).icons( "font" ).setAnchors( true ).attribute( "sectlinks", true ).
            attribute( "encoding", "utf-8" ).linkAttrs( true ).attribute( "idprefix", "" ).
            attribute( "toclevels", 2 ).
            tableOfContents( Placement.RIGHT ).get();

        return options().backend( "html5" ).attributes( attributes ).get();
    }

    public void setSourceDir( String sourceDir )
    {
        this.sourceDir = sourceDir;
    }

    public void setRepoName( String repoName )
    {
        this.repoName = repoName;
    }
}
