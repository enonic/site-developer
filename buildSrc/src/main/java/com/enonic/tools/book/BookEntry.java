package com.enonic.tools.book;

import java.util.Set;

public final class BookEntry
{
    private String key;

    private transient BookKey parsedKey;

    private String vendor;

    private String name;

    private String title;

    private String category;

    private Set<String> tags;

    private String baseUrl;

    public BookKey getKey()
    {
        return this.parsedKey;
    }

    public String getTitle()
    {
        return this.title;
    }

    public String getCategory()
    {
        return this.category;
    }

    public Set<String> getTags()
    {
        return this.tags;
    }

    public String getBaseUrl()
    {
        return this.baseUrl;
    }

    public void setKey( final BookKey key )
    {
        this.parsedKey = key;
        this.key = this.parsedKey.toString();
        this.vendor = this.parsedKey.getVendor();
        this.name = this.parsedKey.getName();
    }

    public void setTitle( final String title )
    {
        this.title = title;
    }

    public void setCategory( final String category )
    {
        this.category = category;
    }

    public void setTags( final Set<String> tags )
    {
        this.tags = tags;
    }

    public void setBaseUrl( final String baseUrl )
    {
        this.baseUrl = baseUrl;
    }
}
