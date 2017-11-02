package com.enonic.tools.rpc;

class JsonResponse
{
    private String error;

    final String getError()
    {
        return this.error;
    }

    final boolean isError()
    {
        return this.error != null;
    }

    final void setError( final String error )
    {
        this.error = error;
    }
}
