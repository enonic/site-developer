package com.enonic.tools.rpc;

import java.util.Set;
import java.util.stream.Collectors;

import org.gradle.api.GradleException;

import com.google.gson.Gson;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.ResponseBody;

import com.enonic.tools.book.BookEntry;
import com.enonic.tools.book.BookKey;
import com.enonic.tools.extractor.ExtractedDoc;

public final class DocRpcClient
{
    private final static MediaType JSON_TYPE = MediaType.parse( "application/json" );

    private final OkHttpClient client;

    private final Gson gson;

    private String endpoint;

    private String authKey;

    public DocRpcClient()
    {
        this.client = new OkHttpClient();
        this.gson = new Gson();
    }

    private <T extends JsonResponse> T execute( final Class<T> responseType, final JsonRequest input )
        throws Exception
    {
        final Request request = new Request.Builder().
            header( "X-AuthKey", this.authKey ).
            url( this.endpoint ).
            post( RequestBody.create( JSON_TYPE, this.gson.toJson( input ) ) ).
            build();

        final Response response = this.client.newCall( request ).execute();
        final ResponseBody body = response.body();

        if ( body == null )
        {
            throw new GradleException( "Request returned empty response (" + response.code() + ")" );
        }

        final String text = body.string();
        final MediaType type = body.contentType();

        if ( ( JSON_TYPE == null ) || !JSON_TYPE.equals( type ) )
        {
            throw new GradleException( "Request returned unknown response (" + response.code() + ")" );
        }

        final T json = this.gson.fromJson( text, responseType );
        if ( response.isSuccessful() )
        {
            return json;
        }

        throw new GradleException( "Error executing request (" + response.code() + ", " + json.getError() + ")" );
    }

    public Set<BookKey> listAll()
        throws Exception
    {
        final ListAllResponse response = execute( ListAllResponse.class, new ListAllRequest() );
        return response.getKeys().stream().map( BookKey::parse ).collect( Collectors.toSet() );
    }

    public void update( final BookEntry entry, final ExtractedDoc doc )
        throws Exception
    {
        final UpdateRequest request = new UpdateRequest();
        request.setEntry( entry );
        request.setDoc( doc );

        execute( JsonResponse.class, request );
    }

    public void delete( final BookKey key )
        throws Exception
    {
        final DeleteRequest request = new DeleteRequest();
        request.setKey( key.toString() );

        execute( JsonResponse.class, request );
    }

    public void setEndpoint( final String endpoint )
    {
        this.endpoint = endpoint;
    }

    public void setAuthKey( final String authKey )
    {
        this.authKey = authKey;
    }
}
