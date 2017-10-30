package com.enonic.app.market;

public class Version
{
    private final Integer major;

    private final Integer minor;

    private final Integer patch;

    public Version( final Integer major, final Integer minor, final Integer patch )
    {
        this.major = major;
        this.minor = minor;
        this.patch = patch;
    }

    public static Version from( final String versionString )
    {
        final String[] versionElements = versionString.split( "\\." );

        if ( versionElements.length < 1 )
        {
            throw new IllegalArgumentException( "Invalid version string [" + versionString + "]" );
        }

        final Integer major = new Integer( versionElements[0] );
        final Integer minor = versionElements.length > 1 ? new Integer( versionElements[1] ) : 0;
        final Integer patch = versionElements.length > 2 ? new Integer( versionElements[2] ) : 0;

        return new Version( major, minor, patch );
    }

    public boolean isCompatible( final Version otherVersion )
    {
        if ( !this.major.equals( otherVersion.major ) )
        {
            return false;
        }

        if ( this.minor > otherVersion.minor )
        {
            return true;
        }

        if ( this.minor < otherVersion.minor )
        {
            return false;
        }

        // same major && minor version

        final boolean isCompatible = this.getPatch() >= otherVersion.getPatch();

        return isCompatible;
    }

    public Integer getMajor()
    {
        return major;
    }

    public Integer getMinor()
    {
        return minor;
    }

    public Integer getPatch()
    {
        return patch;
    }

    public String toString()
    {
        return this.major + "." + this.minor + "." + this.patch;
    }

    @Override
    public boolean equals( final Object o )
    {
        if ( this == o )
        {
            return true;
        }
        if ( o == null || getClass() != o.getClass() )
        {
            return false;
        }

        final Version version = (Version) o;

        if ( major != null ? !major.equals( version.major ) : version.major != null )
        {
            return false;
        }
        if ( minor != null ? !minor.equals( version.minor ) : version.minor != null )
        {
            return false;
        }
        return patch != null ? patch.equals( version.patch ) : version.patch == null;

    }

    @Override
    public int hashCode()
    {
        int result = major != null ? major.hashCode() : 0;
        result = 31 * result + ( minor != null ? minor.hashCode() : 0 );
        result = 31 * result + ( patch != null ? patch.hashCode() : 0 );
        return result;
    }
}
