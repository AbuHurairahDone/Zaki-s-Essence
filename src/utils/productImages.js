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

    // New logic for the updated data structure
    if (selectedVariant && variantImages[selectedVariant]) {
        const variantData = variantImages[selectedVariant];
        // 1. Use the primary image for the selected variant
        if (variantData.primary) {
            return variantData.primary;
        }
        // 2. Fallback to the first image in the variant's gallery
        if (variantData.images && variantData.images.length > 0) {
            return variantData.images[0].url;
        }
    }

    // 3. Fallback to the main product image
    if (product.image) {
        return product.image;
    }

    // 4. Fallback to any other variant's primary or first image
    const anyVariantWithImage = Object.values(variantImages).find(v => v.primary || (v.images && v.images.length > 0));
    if (anyVariantWithImage) {
        return anyVariantWithImage.primary || anyVariantWithImage.images[0].url;
    }

    // 5. Finally, placeholder
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
