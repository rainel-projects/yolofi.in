import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './SearchRedirect.css';

const SearchRedirect = () => {
    const { query } = useParams();

    useEffect(() => {
        if (query) {
            // Decode the query from URL
            const decodedQuery = decodeURIComponent(query);

            // Append site:yolofi.in to search within domain
            const domainQuery = `${decodedQuery} site:yolofi.in`;

            // Encode for search engine URL
            const encodedQuery = encodeURIComponent(domainQuery);

            // Redirect to Google search within yolofi.in domain
            const searchUrl = `https://www.google.com/search?q=${encodedQuery}`;

            // Small delay to show loading state (optional)
            setTimeout(() => {
                window.location.href = searchUrl;
            }, 500);
        }
    }, [query]);

    return (
        <div className="search-redirect-container">
            <div className="search-redirect-content">
                <div className="search-redirect-spinner"></div>
                <h2 className="search-redirect-title">Searching the web...</h2>
                <p className="search-redirect-query">"{decodeURIComponent(query || '')}"</p>
                <p className="search-redirect-hint">Searching within yolofi.in domain</p>
            </div>
        </div>
    );
};

export default SearchRedirect;
