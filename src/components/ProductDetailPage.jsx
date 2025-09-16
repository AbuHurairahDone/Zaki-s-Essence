import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductContext } from '../contexts/contexts.js';
import { CartContext } from '../contexts/contexts.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faTruck, faShield, faExchangeAlt, faArrowLeft, faCheck, faClock, faInfoCircle, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import { CloudinaryService } from '../services/cloudinaryService.js';
import { AnalyticsService } from '../services/analyticsService.js';
import GTMService from '../services/gtmService.js';
import SEOService from '../services/seoService.js';
import { ProductService } from '../services/productService.js';
import { selectVariantImage, buildCartProduct } from '../utils/productImages.js';
import { useSEO } from '../hooks/useSEO.js';

function ProductDetailPage() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { products } = useContext(ProductContext);
    const { addToCart } = useContext(CartContext);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [mainImage, setMainImage] = useState('');
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [activeTab, setActiveTab] = useState('shipping'); // For shipping & returns tabs

    // Set SEO metadata with product data when available
    useSEO('product', product || {});

    useEffect(() => {
        const loadProduct = async () => {
            setLoading(true);
            try {
                const contextProduct = products.find(p => p.id === productId);
                let productData = contextProduct;

                if (!productData) {
                    productData = await ProductService.getProduct(productId);
                }

                setProduct(productData);

                // Default variant selection logic
                let defaultVariant = '';
                if (productData.variants.includes('50ml')) {
                    defaultVariant = '50ml';
                } else if (productData.variants.length > 0) {
                    // Sort variants by size (e.g., 30ml, 50ml, 100ml)
                    const sortedVariants = [...productData.variants].sort((a, b) => {
                        const sizeA = parseInt(a.replace('ml', ''));
                        const sizeB = parseInt(b.replace('ml', ''));
                        return sizeA - sizeB;
                    });
                    defaultVariant = sortedVariants[0];
                }

                setSelectedVariant(defaultVariant);
                setMainImage(selectVariantImage(productData, defaultVariant));

                // Load related products
                const related = products
                    .filter(p => p.category === productData.category && p.id !== productData.id)
                    .slice(0, 4);
                setRelatedProducts(related);

            } catch (error) {
                console.error('Error loading product:', error);
                navigate('/shop');
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            loadProduct();
        }
    }, [productId, products, navigate]);

    useEffect(() => {
        if (product && selectedVariant) {
            // Track product view
            AnalyticsService.trackProductView(product);
            GTMService.trackProductView(product);

            // Update main image when variant changes
            setMainImage(selectVariantImage(product, selectedVariant));

            // Add structured data for SEO
            const variantPrice = (product.variantPricing && product.variantPricing[selectedVariant])
                ? product.variantPricing[selectedVariant]
                : (product.price || 0);
            const discountedPrice = (product.discountPercentage && product.discountPercentage > 0)
                ? (variantPrice - (variantPrice * product.discountPercentage / 100))
                : variantPrice;
            const selectedImage = selectVariantImage(product, selectedVariant);
            const optimizedImage = selectedImage && selectedImage.includes('cloudinary.com')
                ? CloudinaryService.getProductQualityUrl(selectedImage, { width: 800, height: 1000 })
                : selectedImage;
            const inStockVal = (product.stock && product.stock[selectedVariant] !== undefined)
                ? product.stock[selectedVariant] > 0
                : true;

            const productSchema = SEOService.generateProductSchema({
                ...product,
                price: discountedPrice,
                inStock: inStockVal,
                images: [optimizedImage || selectedImage]
            });

            SEOService.addStructuredData(productSchema);
        }
    }, [product, selectedVariant]);

    const handleVariantChange = (variant) => {
        setSelectedVariant(variant);

        // Track variant selection
        if (product) {
            AnalyticsService.trackFunnelStep(0, 'variant_selected', {
                product_id: product.id,
                product_name: product.name,
                variant_selected: variant,
                variant_price: getVariantPrice(variant)
            });

            GTMService.trackCustomEvent('variant_selected', {
                product_id: product.id,
                product_name: product.name,
                variant: variant,
                price: getVariantPrice(variant)
            });
        }
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (value > 0) {
            setQuantity(value);
        }
    };

    const incrementQuantity = () => {
        setQuantity(prev => prev + 1);
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = async () => {
        if (!product || !selectedVariant) return;

        setIsAddingToCart(true);

        try {
            // Add slight delay for better UX
            await new Promise(resolve => setTimeout(resolve, 300));

            const cartProduct = buildCartProduct(product, selectedVariant);

            // Track add to cart event
            GTMService.trackAddToCart(cartProduct, selectedVariant, quantity);

            // Add to cart multiple times based on quantity
            for (let i = 0; i < quantity; i++) {
                addToCart(cartProduct, selectedVariant);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
        } finally {
            setIsAddingToCart(false);
        }
    };

    const getVariantPrice = (variant) => {
        if (!product) return 0;
        return product.variantPricing?.[variant] || product.price || 0;
    };

    const getDiscountedPrice = (price) => {
        if (!product) return price;

        if (product.discountPercentage && product.discountPercentage > 0) {
            return price - (price * product.discountPercentage / 100);
        }
        return price;
    };

    const getCurrentPrice = () => {
        const price = getVariantPrice(selectedVariant);
        return { original: price, discounted: getDiscountedPrice(price) };
    };

    const getVariantStock = (variant) => {
        if (!product || !product.stock) return null;
        return product.stock[variant] ?? null;
    };

    const getOptimizedImageUrl = (url, size = { width: 800, height: 1000 }) => {
        if (!url) return null;
        return url.includes('cloudinary.com')
            ? CloudinaryService.getProductQualityUrl(url, size)
            : url;
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin w-12 h-12 border-4 border-yellow-700 border-t-transparent rounded-full"></div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
                    <p className="mb-6">The product you're looking for doesn't exist or has been removed.</p>
                    <button
                        onClick={() => navigate('/shop')}
                        className="bg-primary text-white px-6 py-2 rounded-md hover:bg-secondary transition"
                    >
                        Return to Shop
                    </button>
                </div>
            </div>
        );
    }

    const { original, discounted } = getCurrentPrice();
    const selectedVariantStock = getVariantStock(selectedVariant);
    const isInStock = selectedVariantStock === null || selectedVariantStock > 0;

    return (
        <div className="container mx-auto px-4 py-8 md:py-16 animate-fade">
            {/* Back Button */}
            <button
                onClick={handleGoBack}
                className="flex items-center text-gray-600 hover:text-yellow-700 mb-6 transition"
            >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Back
            </button>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* Product Images Section */}
                <div className="lg:w-1/2">
                    <div className="bg-white rounded-lg overflow-hidden shadow-md mb-4">
                        <img
                            src={getOptimizedImageUrl(mainImage)}
                            alt={`${product.name} - ${selectedVariant}`}
                            className="w-full object-cover aspect-[4/5]"
                        />
                    </div>

                    {/* Variant Image Gallery */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {product.variantImages?.[selectedVariant]?.images.length > 0 ? (
                            product.variantImages[selectedVariant].images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setMainImage(image.url)}
                                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${mainImage === image.url ? 'border-yellow-700' : 'border-gray-200'}`}
                                >
                                    <img
                                        src={getOptimizedImageUrl(image.url, { width: 100, height: 100 })}
                                        alt={`${product.name} - ${selectedVariant} thumbnail ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))
                        ) : (
                            <div className="w-20 h-20 rounded-md overflow-hidden border-2 border-yellow-700">
                                <img
                                    src={getOptimizedImageUrl(product.image, { width: 100, height: 100 })}
                                    alt={`${product.name} - main image`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Details Section */}
                <div className="lg:w-1/2">
                    <div className="bg-white rounded-lg p-6 shadow-md">
                        {/* Product Category */}
                        <div className="text-sm text-gray-500 mb-2">{product.category}</div>

                        {/* Product Name */}
                        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

                        {/* Rating */}
                        {/* Rating */}
                        {product.rating ? (
                            <div className="flex items-center">
                                {/* Stars */}
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <FontAwesomeIcon
                                            key={i}
                                            icon={faStar}
                                            className={`transition-colors ${i < Math.floor(product.rating)
                                                ? "text-yellow-500"
                                                : "text-gray-300"
                                                } text-sm sm:text-base md:text-lg`}
                                        />
                                    ))}
                                </div>

                                {/* Score */}
                                <span className="ml-2 text-xs sm:text-sm md:text-base font-medium text-gray-700">
                                    {product.rating}/5
                                </span>
                            </div>
                        ) : (

                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <FontAwesomeIcon
                                        key={i}
                                        icon={faStar}
                                        className={`text-gray-300 text-sm sm:text-base md:text-lg`}
                                    />
                                ))}
                            </div>

                        )}



                        {/* Variants */}
                        <div className="mb-6 mt-4">
                            <h2 className="text-lg font-semibold mb-2">Size</h2>
                            <div className="flex flex-wrap gap-2">
                                {product.variants.map(variant => (
                                    <button
                                        key={variant}
                                        onClick={() => handleVariantChange(variant)}
                                        disabled={getVariantStock(variant) === 0}
                                        className={`px-4 py-2 rounded-md transition ${selectedVariant === variant
                                            ? 'bg-primary text-white'
                                            : getVariantStock(variant) === 0
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                                    >
                                        {variant}
                                        {getVariantStock(variant) === 0 && ' (Out of Stock)'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold mb-2">Quantity</h2>
                            <div className="flex items-center">
                                <button
                                    onClick={decrementQuantity}
                                    disabled={quantity <= 1 || !isInStock}
                                    className={`w-10 h-10 flex items-center justify-center rounded-l-md ${isInStock ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    disabled={!isInStock}
                                    className="w-16 h-10 text-center border-y border-gray-200 focus:outline-none"
                                />
                                <button
                                    onClick={incrementQuantity}
                                    disabled={!isInStock}
                                    className={`w-10 h-10 flex items-center justify-center rounded-r-md ${isInStock ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="mb-6 mt-4">
                            <div className="flex items-center">
                                <span className="text-2xl font-bold text-gray-900">Rs. {discounted.toFixed(0)}</span>
                                {discounted !== original && (
                                    <span className="ml-2 text-sm line-through text-gray-500">Rs. {original.toFixed(0)}</span>
                                )}
                                {product.discountPercentage > 0 && (
                                    <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded">
                                        {product.discountPercentage}% OFF
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold mb-2">Description</h2>
                            <p className="text-gray-700">{product.description}</p>
                        </div>






                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={isAddingToCart || !isInStock}
                            className={`w-full py-3 rounded-md font-medium transition ${isInStock
                                ? 'bg-primary text-white hover:bg-secondary'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                        >
                            {isAddingToCart
                                ? 'Adding to Cart...'
                                : !isInStock
                                    ? 'Out of Stock'
                                    : 'Add to Cart'}
                        </button>


                        {/* Fragrance Notes */}
                        <div className="mb-6 pt-6 mt-8">
                            <h2 className="text-lg font-semibold mb-2">Fragrance Notes</h2>
                            {(product.fragranceNotes?.top || product.fragranceNotes?.middle || product.fragranceNotes?.base) ? (
                                <div className="space-y-3">
                                    {product.fragranceNotes?.top && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700">Top Notes</h3>
                                            <p className="text-gray-700">{product.fragranceNotes.top}</p>
                                        </div>
                                    )}

                                    {product.fragranceNotes?.middle && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700">Middle Notes</h3>
                                            <p className="text-gray-700">{product.fragranceNotes.middle}</p>
                                        </div>
                                    )}

                                    {product.fragranceNotes?.base && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700">Base Notes</h3>
                                            <p className="text-gray-700">{product.fragranceNotes.base}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No fragrance notes available for this product.</p>
                            )}
                        </div>



                    </div>

                </div>

            </div>
            {/* Product Features */}
            <div className="mt-8 border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">

                    Product Features
                </h2>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 shadow-sm">
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                        <li className="flex items-start transition-all hover:bg-white hover:shadow-md p-2 sm:p-3 rounded-md cursor-pointer hover:translate-y-[-2px]">
                            <div className="bg-green-100 p-1.5 sm:p-2 rounded-full mr-2 sm:mr-3 flex-shrink-0">
                                <FontAwesomeIcon icon={faCheck} className="text-green-600 text-sm sm:text-base" />
                            </div>
                            <div>
                                <span className="font-medium block text-sm sm:text-base">Premium Quality</span>
                                <span className="text-xs sm:text-sm text-gray-600">Crafted with the finest ingredients</span>
                            </div>
                        </li>
                        {product.scentLasting && (
                            <li className="flex items-start transition-all hover:bg-white hover:shadow-md p-2 sm:p-3 rounded-md cursor-pointer hover:translate-y-[-2px]">
                                <div className="bg-green-100 p-1.5 sm:p-2 rounded-full mr-2 sm:mr-3 flex-shrink-0">
                                    <FontAwesomeIcon icon={faCheck} className="text-green-600 text-sm sm:text-base" />
                                </div>
                                <div>
                                    <span className="font-medium block text-sm sm:text-base">Long-lasting</span>
                                    <span className="text-xs sm:text-sm text-gray-600">{product.scentLasting}</span>
                                </div>
                            </li>
                        )}
                        <li className="flex items-start transition-all hover:bg-white hover:shadow-md p-2 sm:p-3 rounded-md cursor-pointer hover:translate-y-[-2px]">
                            <div className="bg-green-100 p-1.5 sm:p-2 rounded-full mr-2 sm:mr-3 flex-shrink-0">
                                <FontAwesomeIcon icon={faCheck} className="text-green-600 text-sm sm:text-base" />
                            </div>
                            <div>
                                <span className="font-medium block text-sm sm:text-base">Elegant Design</span>
                                <span className="text-xs sm:text-sm text-gray-600">Sophisticated bottle presentation</span>
                            </div>
                        </li>
                        <li className="flex items-start transition-all hover:bg-white hover:shadow-md p-2 sm:p-3 rounded-md cursor-pointer hover:translate-y-[-2px]">
                            <div className="bg-green-100 p-1.5 sm:p-2 rounded-full mr-2 sm:mr-3 flex-shrink-0">
                                <FontAwesomeIcon icon={faCheck} className="text-green-600 text-sm sm:text-base" />
                            </div>
                            <div>
                                <span className="font-medium block text-sm sm:text-base">Unique Blend</span>
                                <span className="text-xs sm:text-sm text-gray-600">Exclusive fragrance composition</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Shipping & Returns */}
            <div className="mt-8 border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">

                    Shipping & Returns
                </h2>

                <div className="bg-gray-50 rounded-lg overflow-hidden shadow-sm">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('shipping')}
                            className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 text-center font-medium text-sm sm:text-base ${activeTab === 'shipping' ? 'bg-white border-b-2 border-yellow-700 text-yellow-700' : 'text-gray-600 hover:text-gray-800'}`}
                            aria-selected={activeTab === 'shipping'}
                            role="tab"
                        >
                            <FontAwesomeIcon icon={faTruck} className="mr-1 sm:mr-2 d-none d-sm-inline" />
                            Shipping
                        </button>
                        <button
                            onClick={() => setActiveTab('returns')}
                            className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 text-center font-medium text-sm sm:text-base ${activeTab === 'returns' ? 'bg-white border-b-2 border-yellow-700 text-yellow-700' : 'text-gray-600 hover:text-gray-800'}`}
                            aria-selected={activeTab === 'returns'}
                            role="tab"
                        >
                            <FontAwesomeIcon icon={faExchangeAlt} className="mr-1 sm:mr-2 d-none d-sm-inline" />
                            Returns
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-3 sm:p-4">
                        {activeTab === 'shipping' && (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                                    {product.minOrderFreeShip && (
                                        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-all hover:translate-y-[-2px]">
                                            <div className="flex items-center mb-2">
                                                <div className="bg-blue-100 p-1.5 sm:p-2 rounded-full mr-2 flex-shrink-0">
                                                    <FontAwesomeIcon icon={faTruck} className="text-blue-600 text-sm sm:text-base" />
                                                </div>
                                                <h3 className="font-medium text-sm sm:text-base">Free Shipping</h3>
                                            </div>
                                            <p className="text-sm text-gray-600">On orders over Rs. {product.minOrderFreeShip}</p>
                                            <p className="text-xs text-gray-500 mt-2">Delivered within 3-5 business days</p>
                                        </div>
                                    )}
                                    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border-l-4 border-green-500 hover:shadow-md transition-all hover:translate-y-[-2px]">
                                        <div className="flex items-center mb-2">
                                            <div className="bg-green-100 p-1.5 sm:p-2 rounded-full mr-2 flex-shrink-0">
                                                <FontAwesomeIcon icon={faShield} className="text-green-600 text-sm sm:text-base" />
                                            </div>
                                            <h3 className="font-medium text-sm sm:text-base">Secure Payments</h3>
                                        </div>
                                        <p className="text-sm text-gray-600">100% secure payment</p>
                                        <p className="text-xs text-gray-500 mt-2">Multiple payment methods accepted</p>
                                    </div>
                                    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border-l-4 border-yellow-500 hover:shadow-md transition-all hover:translate-y-[-2px]">
                                        <div className="flex items-center mb-2">
                                            <div className="bg-yellow-100 p-1.5 sm:p-2 rounded-full mr-2 flex-shrink-0">
                                                <FontAwesomeIcon icon={faClock} className="text-yellow-600 text-sm sm:text-base" />
                                            </div>
                                            <h3 className="font-medium text-sm sm:text-base">Delivery Time</h3>
                                        </div>
                                        <p className="text-sm text-gray-600">3-5 business days</p>
                                        <p className="text-xs text-gray-500 mt-2">Express options available</p>
                                    </div>
                                </div>
                            </>)}

                        {activeTab === 'returns' && (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                                    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-all hover:translate-y-[-2px]">
                                        <div className="flex items-center mb-2">
                                            <div className="bg-purple-100 p-1.5 sm:p-2 rounded-full mr-2 flex-shrink-0">
                                                <FontAwesomeIcon icon={faExchangeAlt} className="text-purple-600 text-sm sm:text-base" />
                                            </div>
                                            <h3 className="font-medium text-sm sm:text-base">Easy Returns</h3>
                                        </div>
                                        <p className="text-sm text-gray-600">10 day return policy</p>
                                        <p className="text-xs text-gray-500 mt-2">Hassle-free return process</p>
                                    </div>

                                    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border-l-4 border-red-500 hover:shadow-md transition-all hover:translate-y-[-2px]">
                                        <div className="flex items-center mb-2">
                                            <div className="bg-red-100 p-1.5 sm:p-2 rounded-full mr-2 flex-shrink-0">
                                                <FontAwesomeIcon icon={faInfoCircle} className="text-red-600 text-sm sm:text-base" />
                                            </div>
                                            <h3 className="font-medium text-sm sm:text-base">Return Conditions</h3>
                                        </div>
                                        <p className="text-sm text-gray-600">Unopened products only</p>
                                        <p className="text-xs text-gray-500 mt-2">Original packaging required</p>
                                    </div>

                                    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border-l-4 border-teal-500 hover:shadow-md transition-all hover:translate-y-[-2px]">
                                        <div className="flex items-center mb-2">
                                            <div className="bg-teal-100 p-1.5 sm:p-2 rounded-full mr-2 flex-shrink-0">
                                                <FontAwesomeIcon icon={faMoneyBillWave} className="text-teal-600 text-sm sm:text-base" />
                                            </div>
                                            <h3 className="font-medium text-sm sm:text-base">Refund Process</h3>
                                        </div>
                                        <p className="text-sm text-gray-600">7-10 days for refund</p>
                                        <p className="text-xs text-gray-500 mt-2">Original payment method</p>
                                    </div>
                                </div>

                                <div className="mt-3 sm:mt-4 bg-purple-50 border border-purple-200 rounded-lg p-2 sm:p-3">
                                    <p className="text-xs sm:text-sm text-purple-800">
                                        <strong>Return Process:</strong> Contact our customer service team within 30 days of receiving your order to initiate a return.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div className="mt-16">
                    <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>

                    {/* Mobile: Horizontal scroll */}
                    <div className="block md:hidden">
                        <div className="flex overflow-x-auto space-x-4 px-2 pb-4 scrollbar-hide">
                            {relatedProducts.map(relatedProduct => (
                                <div
                                    key={relatedProduct.id}
                                    className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer transform  duration-500 hover:scale-[1.02]"
                                    onClick={() => navigate(`/product/${relatedProduct.id}`)}
                                >
                                    <div className="aspect-[4/5] overflow-hidden">
                                        <img
                                            src={getOptimizedImageUrl(
                                                selectVariantImage(relatedProduct, relatedProduct.variants[0]),
                                                { width: 300, height: 375 }
                                            )}
                                            alt={relatedProduct.name}
                                            className="w-full h-full object-cover hover:scale-105 transition"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-medium">{relatedProduct.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-1">{relatedProduct.description}</p>
                                        <div className="mt-2 font-bold">
                                            Rs. {relatedProduct.variantPricing?.[relatedProduct.variants[0]].toFixed(0) || relatedProduct.price.toFixed(0)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Desktop: Grid layout */}
                    <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {relatedProducts.map(relatedProduct => (
                            <div
                                key={relatedProduct.id}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
                                onClick={() => navigate(`/product/${relatedProduct.id}`)}
                            >
                                <div className="aspect-[4/5] overflow-hidden">
                                    <img
                                        src={getOptimizedImageUrl(
                                            selectVariantImage(relatedProduct, relatedProduct.variants[0]),
                                            { width: 300, height: 375 }
                                        )}
                                        alt={relatedProduct.name}
                                        className="w-full h-full object-cover hover:scale-105 transition"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-medium">{relatedProduct.name}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-1">{relatedProduct.description}</p>
                                    <div className="mt-2 font-bold">
                                        Rs. {relatedProduct.variantPricing?.[relatedProduct.variants[0]].toFixed(0) || relatedProduct.price.toFixed(0)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductDetailPage;
