'use client';

import { useEffect, useState } from 'react';
import NProgress from 'nprogress';

interface ApiProgressProviderProps {
    children: React.ReactNode;
}

export default function ApiProgressProvider({ children }: ApiProgressProviderProps) {
    const [pendingRequests, setPendingRequests] = useState(0);

    useEffect(() => {
        let activeRequests = 0;

        // Intercept fetch requests
        const originalFetch = window.fetch;
        
        window.fetch = async (...args) => {
            activeRequests++;
            setPendingRequests(activeRequests);
            
            if (activeRequests === 1) {
                NProgress.start();
            }

            try {
                const response = await originalFetch(...args);
                return response;
            } finally {
                activeRequests--;
                setPendingRequests(activeRequests);
                
                if (activeRequests === 0) {
                    NProgress.done();
                }
            }
        };

        // Intercept XMLHttpRequest
        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalXHRSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async: boolean = true, username?: string | null, password?: string | null) {
            (this as any)._isApiRequest = true;
            return originalXHROpen.call(this, method, url, async, username, password);
        };

        XMLHttpRequest.prototype.send = function(body?: Document | XMLHttpRequestBodyInit | null) {
            if ((this as any)._isApiRequest) {
                activeRequests++;
                setPendingRequests(activeRequests);
                
                if (activeRequests === 1) {
                    NProgress.start();
                }

                this.addEventListener('loadend', () => {
                    activeRequests--;
                    setPendingRequests(activeRequests);
                    
                    if (activeRequests === 0) {
                        NProgress.done();
                    }
                });
            }
            
            return originalXHRSend.call(this, body);
        };

        return () => {
            // Restore original functions
            window.fetch = originalFetch;
            XMLHttpRequest.prototype.open = originalXHROpen;
            XMLHttpRequest.prototype.send = originalXHRSend;
        };
    }, []);

    return <>{children}</>;
} 