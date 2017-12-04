package com.enonic.site.developer.tools.doc;

import org.jsoup.nodes.Element;

public final class ExtractedDoc
{
    private Element content;

    public ExtractedDoc( final Element content )
    {
        this.content = content;
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
}
