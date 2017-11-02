package com.enonic.tools.book;

import java.io.File;
import java.io.FileReader;
import java.util.HashSet;
import java.util.Set;

import org.gradle.api.GradleException;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.introspector.BeanAccess;

public final class BookService
{
    private final Yaml yaml;

    private final File baseDir;

    public BookService( final File baseDir )
    {
        this.yaml = new Yaml();
        this.yaml.setBeanAccess( BeanAccess.PROPERTY );
        this.baseDir = baseDir;
    }

    public Set<BookKey> listBooks()
    {
        final Set<BookKey> result = new HashSet<>();
        findBooks( result, baseDir );
        return result;
    }

    private void findBooks( final Set<BookKey> result, final File baseDir )
    {
        final File[] list = baseDir.listFiles( File::isDirectory );
        if ( list != null )
        {
            for ( final File file : list )
            {
                findBooks( result, file, file.getName() );
            }
        }
    }

    private void findBooks( final Set<BookKey> result, final File vendorDir, final String vendor )
    {
        final File[] list = vendorDir.listFiles( path -> path.isFile() && path.getName().endsWith( ".yml" ) );
        if ( list != null )
        {
            for ( final File file : list )
            {
                result.add( BookKey.from( vendor, file.getName().replace( ".yml", "" ) ) );
            }
        }
    }

    public BookEntry parseBook( final BookKey key )
    {
        final File vendorDir = new File( this.baseDir, key.getVendor() );
        final File file = new File( vendorDir, key.getName() + ".yml" );

        if ( !file.isFile() )
        {
            return null;
        }

        try
        {
            final BookEntry entry = this.yaml.loadAs( new FileReader( file ), BookEntry.class );
            entry.setKey( key );
            return entry;
        }
        catch ( final Exception e )
        {
            throw new GradleException( "Failed to parse book yml [" + key + "]", e );
        }
    }
}
