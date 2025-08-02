import React, { useState, useCallback } from 'react';
import { AdvancedImage, lazyload, responsive, placeholder } from '@cloudinary/react';
import { CloudinaryImage } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { auto as autoFormat } from '@cloudinary/url-gen/actions/delivery';
import { auto as autoQuality } from '@cloudinary/url-gen/actions/delivery';

const OptimizedImage = ({
    src,
    alt,
    className = '',
    width,
    height,
    priority = false,
    cloudinaryId = null,
    sizes = "100vw",
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleLoad = useCallback(() => {
        setIsLoaded(true);
    }, []);

    const handleError = useCallback(() => {
        setHasError(true);
    }, []);

    // If it's a Cloudinary image, use optimized delivery
    if (cloudinaryId) {
        const cldImage = new CloudinaryImage(cloudinaryId, {
            cloudName: 'your-cloud-name' // Replace with your Cloudinary cloud name
        })
            .resize(auto().width(width).height(height))
            .delivery(autoFormat())
            .delivery(autoQuality());

        const plugins = [
            responsive({ steps: [800, 1000, 1400] }),
            placeholder({ mode: 'blur' })
        ];

        if (!priority) {
            plugins.push(lazyload());
        }

        return (
            <AdvancedImage
                cldImg={cldImage}
                plugins={plugins}
                className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
                onLoad={handleLoad}
                onError={handleError}
                alt={alt}
                {...props}
            />
        );
    }

    // For regular images, use optimized loading
    const imageSrcSet = width && height ?
        `${src}?w=${Math.round(width * 0.5)} ${Math.round(width * 0.5)}w,
     ${src}?w=${width} ${width}w,
     ${src}?w=${Math.round(width * 1.5)} ${Math.round(width * 1.5)}w` :
        undefined;

    return (
        <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
            {!isLoaded && !hasError && (
                <div
                    className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"
                    style={{
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s infinite'
                    }}
                />
            )}

            <img
                src={src}
                srcSet={imageSrcSet}
                sizes={sizes}
                alt={alt}
                className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                onLoad={handleLoad}
                onError={handleError}
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={priority ? 'high' : 'low'}
                {...props}
            />

            {hasError && (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Image failed to load</span>
                </div>
            )}
        </div>
    );
};

export default OptimizedImage;
