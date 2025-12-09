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
        <div className="google-ad-container" style={{ textAlign: 'center', ...style }}>
            {/* AdSense Display Unit - Collapses automatically if empty */}
            <ins className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-5518844041121398"
                data-ad-slot={slot || "0000000000"}
                data-ad-format={format}
                data-full-width-responsive={fullWidthResponsive}
            ></ins>
        </div>
    );
};

export default GoogleAd;
