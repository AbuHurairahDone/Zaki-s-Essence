  import React from 'react';
  function CollectionsSection() {
            const collections = [
                {
                    id: 1,
                    name: "Floral Fantasy",
                    description: "A romantic bouquet of delicate florals",
                    image: "https://placehold.co/800x500/EEE/31343C?text=Floral+Fantasy"
                },
                {
                    id: 2,
                    name: "Oriental Dreams",
                    description: "Exotic spices and warm ambers",
                    image: "https://placehold.co/800x500/EEE/31343C?text=Oriental+Dreams"
                },
                {
                    id: 3,
                    name: "Fresh Escapes",
                    description: "Crisp and invigorating citrus notes",
                    image: "https://placehold.co/800x500/EEE/31343C?text=Fresh+Escapes"
                }
            ];
            
            return (
                <section id="collections" className="py-16">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12 animate-slide">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Collections</h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">Explore our curated fragrance families for every occasion.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {collections.map((collection, index) => (
                                <div 
                                    key={collection.id} 
                                    className={`relative group overflow-hidden rounded-lg ${index !== collections.length - 1 ? 'animate-slide delay-' + (index + 1) : 'animate-slide delay-3'}`}
                                >
                                    <img 
                                        src={collection.image} 
                                        alt={collection.name} 
                                        className="w-full h-64 object-cover group-hover:scale-105 transition duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6">
                                        <h3 className="text-xl font-bold text-white mb-2">{collection.name}</h3>
                                        <p className="text-gray-200 mb-4">{collection.description}</p>
                                        <a 
                                            href="#" 
                                            className="text-white border border-white px-4 py-2 rounded-md hover:bg-white hover:text-gray-900 transition inline-block w-max"
                                        >
                                            View Collection
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            );
        }

        export default CollectionsSection