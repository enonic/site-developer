package com.enonic.tools.rpc;

import com.enonic.tools.book.BookEntry;
import com.enonic.tools.extractor.ExtractedDoc;

final class UpdateRequest
    extends JsonRequest
{
    private BookEntry entry;

    private ExtractedDoc doc;

    UpdateRequest()
    {
        setOperation( "update" );
    }

    public BookEntry getEntry()
    {
        return this.entry;
    }

    public void setEntry( final BookEntry entry )
    {
        this.entry = entry;
    }

    public ExtractedDoc getDoc()
    {
        return this.doc;
    }

    public void setDoc( final ExtractedDoc doc )
    {
        this.doc = doc;
    }
}
