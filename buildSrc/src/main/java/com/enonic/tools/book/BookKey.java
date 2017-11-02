package com.enonic.tools.book;

import java.util.Objects;

public final class BookKey
{
    private final String vendor;

    private final String name;

    private BookKey( final String vendor, final String name )
    {
        this.vendor = vendor;
        this.name = name;
    }

    public String getVendor()
    {
        return this.vendor;
    }

    public String getName()
    {
        return this.name;
    }

    @Override
    public String toString()
    {
        return this.vendor + ":" + this.name;
    }

    @Override
    public int hashCode()
    {
        return Objects.hash( this.vendor, this.name );
    }

    @Override
    public boolean equals( final Object o )
    {
        return ( o instanceof BookKey ) && Objects.equals( this.vendor, ( (BookKey) o ).vendor ) &&
            Objects.equals( this.name, ( (BookKey) o ).name );
    }

    public static BookKey parse( final String value )
    {
        final String[] split = value.split( ":" );
        if ( split.length != 2 )
        {
            throw new IllegalArgumentException( "Failed to parse key [" + value + "]" );
        }

        return from( split[0].trim(), split[1].trim() );
    }

    public static BookKey from( final String vendor, final String name )
    {
        return new BookKey( vendor, name );
    }
}
