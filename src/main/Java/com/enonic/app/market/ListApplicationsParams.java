package com.enonic.app.market;

public class ListApplicationsParams
{
    private Integer from;

    private Integer size;

    private Version xpVersion;

    private String versionFieldName;

    private String[] names;

    private String contentTypeName;

    private String orderBy;

    private String[] ids;

    public String getOrderBy()
    {
        return orderBy;
    }

    public void setOrderBy( final String orderBy )
    {
        this.orderBy = orderBy;
    }

    public void setFrom( final Integer from )
    {
        this.from = from;
    }

    public void setSize( final Integer size )
    {
        this.size = size;
    }

    public void setXpVersion( final String xpVersion )
    {
        this.xpVersion = Version.from( xpVersion );
    }

    public void setVersionFieldName( final String versionFieldName )
    {
        this.versionFieldName = versionFieldName;
    }

    public void setXpVersion( final Version xpVersion )
    {
        this.xpVersion = xpVersion;
    }

    public String getContentTypeName()
    {
        return contentTypeName;
    }

    public void setContentTypeName( final String contentTypeName )
    {
        this.contentTypeName = contentTypeName;
    }

    public String[] getNames()
    {
        return names;
    }

    public void setNames( final String[] names )
    {
        this.names = names;
    }

    public Integer getFrom()
    {
        return from;
    }

    public Integer getSize()
    {
        return size;
    }

    public Version getXpVersion()
    {
        return xpVersion;
    }

    public String getVersionFieldName()
    {
        return versionFieldName;
    }

    public String[] getIds()
    {
        return ids;
    }

    public void setIds( final String[] ids )
    {
        this.ids = ids;
    }
}
