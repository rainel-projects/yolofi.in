import React, { useEffect } from 'react';

const GoogleAd = ({ slot, format = 'auto', fullWidthResponsive = 'true', style = {} }) => {
    useEffect(() => {
        try {
            // Push the ad to the Google Ads queue
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense Error:", e);
        }
    }, []);

    return (
        <div className="google-ad-container" style={{ margin: '1rem 0', textAlign: 'center', minHeight: '90px', ...style }}>
            {/* AdSense Display Unit */}
            <ins className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-5518844041121398" // Updated to real ID
                data-ad-slot={slot || "0000000000"}      // PLACEHOLDER: Replace this!
                data-ad-format={format}
                data-full-width-responsive={fullWidthResponsive}
            ></ins>
            <span style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase' }}>Advertisement</span>
        </div>
    );
};

export default GoogleAd;
