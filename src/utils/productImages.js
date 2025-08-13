// filepath: /Users/mac/junaidAfzal/Zaki-s-Essence/src/utils/productImages.js

// Select the best image URL for a given product and selected variant
// Fallback order:
// 1) variantImages[selectedVariant]
// 2) first available image in variantImages
// 3) product.image
// 4) placeholder
export function selectVariantImage(product, selectedVariant, placeholder = '/placeholder-image.jpg') {
    if (!product) return placeholder;

    const variantImages = product.variantImages || {};

    // Prefer the selected variant's image if available and non-empty
    const selectedUrl = variantImages && variantImages[selectedVariant];
    if (selectedUrl) return selectedUrl;

    // Then any other variant image if present
    if (variantImages && typeof variantImages === 'object') {
        const anyUrl = Object.values(variantImages).find((url) => !!url);
        if (anyUrl) return anyUrl;
    }

    // Then product-level image
    if (product.image) return product.image;

    // Finally placeholder
    return placeholder;
}

// Build a cart-ready product copy where price and image reflect the selected variant
export function buildCartProduct(product, variant) {
    if (!product) return null;

    // Compute price similar to CartContext/ProductCard logic
    const getVariantPrice = (p, v) => {
        if (p.variantPricing && p.variantPricing[v]) return p.variantPricing[v];
        return p.price || 0;
    };

    const applyDiscount = (price, p) => {
        if (p.discountPercentage && p.discountPercentage > 0) {
            return price - (price * p.discountPercentage / 100);
        }
        return price;
    };

    const basePrice = getVariantPrice(product, variant);
    const finalPrice = applyDiscount(basePrice, product);

    // Image selection
    const image = selectVariantImage(product, variant);

    return {
        ...product,
        price: finalPrice,
        image
    };
}

export default {
    selectVariantImage,
    buildCartProduct
};