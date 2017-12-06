package com.enonic.site.developer.tools.doc;

import org.jsoup.nodes.Element;

public final class ExtractedDoc
{
    private Element content;

    private String title;

    public ExtractedDoc( final Element content, final String title )
    {
        this.content = content;
        this.title = title;
    }

    public String getHtml()
    {
        return content.toString();
    }

    public String getText()
    {
        return content.text();
    }

    public Element getContent()
    {
        return content;
    }

    public String getTitle()
    {
        return title;
    }
}
