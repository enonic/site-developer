package com.enonic.tools.tasks;

import java.util.Set;

import org.gradle.api.tasks.TaskAction;

import com.enonic.tools.book.BookEntry;
import com.enonic.tools.book.BookKey;
import com.enonic.tools.book.BookService;
import com.enonic.tools.extractor.ExtractedDoc;
import com.enonic.tools.extractor.ExtractorService;
import com.enonic.tools.rpc.DocRpcClient;

public class SyncDocsTask
    extends AbstractTask
{
    private BookService bookService;

    private DocRpcClient rpcClient;

    private ExtractorService extractorService;

    public SyncDocsTask()
    {
        setGroup( "Docs" );
        setDescription( "Sync documentation entries from this repo to the portal." );
    }

    @TaskAction
    public void run()
        throws Exception
    {
        this.rpcClient = new DocRpcClient();
        this.rpcClient.setAuthKey( this.extension.getDocsAuthKey() );
        this.rpcClient.setEndpoint( this.extension.getDocsEndpoint() );

        this.bookService = new BookService( this.extension.getDocsBaseDir() );
        this.extractorService = new ExtractorService();

        final Set<BookKey> books = this.bookService.listBooks();
        syncAll( books );
        deleteNotNeeded( books );
    }

    private void syncAll( final Set<BookKey> keys )
        throws Exception
    {
        for ( final BookKey key : keys )
        {
            sync( key );
        }
    }

    private void sync( final BookKey key )
        throws Exception
    {
        final BookEntry entry = this.bookService.parseBook( key );
        if ( entry != null )
        {
            sync( entry );
        }
    }

    private void sync( final BookEntry entry )
        throws Exception
    {
        getLogger().lifecycle( "Updating entry [" + entry.getKey().toString() + "]..." );

        final ExtractedDoc doc = this.extractorService.getHtml( entry.getBaseUrl() );
        this.rpcClient.update( entry, doc );
    }

    private void deleteNotNeeded( final Set<BookKey> keys )
        throws Exception
    {
        final Set<BookKey> remoteKeys = this.rpcClient.listAll();
        remoteKeys.removeAll( keys );

        for ( final BookKey key : remoteKeys )
        {
            getLogger().lifecycle( "Deleting entry [" + key + "]..." );
            this.rpcClient.delete( key );
        }
    }
}
