import React, { useState, createContext } from "react";
import { products } from "../products.js";

export const ProductContext = createContext();


export const ProductProvider = ({ children }) => {
    return (
        <ProductContext.Provider value={{ products }}>
            {children}
        </ProductContext.Provider>
    );
};

export default ProductProvider;