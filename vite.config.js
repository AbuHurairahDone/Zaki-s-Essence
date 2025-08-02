import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import compression from 'vite-plugin-compression'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),

        // Gzip compression for assets
        compression({
            algorithm: 'gzip',
            ext: '.gz',
            threshold: 1024,
            deleteOriginFile: false
        }),

        // Brotli compression for even better compression
        compression({
            algorithm: 'brotliCompress',
            ext: '.br',
            threshold: 1024,
            deleteOriginFile: false
        }),

        // PWA for better caching and performance
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'cloudinary-images',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                            }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'google-fonts-stylesheets'
                        }
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-webfonts',
                            expiration: {
                                maxEntries: 30,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                            }
                        }
                    }
                ]
            },
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo.png'],
            manifest: {
                name: "Zaki's Essence",
                short_name: 'ZakisEssence',
                description: 'Premium luxury fragrances and perfumes online store',
                theme_color: '#b45309',
                icons: [
                    {
                        src: 'logo.png',
                        sizes: '192x192',
                        type: 'image/png'
                    }
                ]
            }
        }),

        // Bundle analyzer for production builds
        process.env.ANALYZE && visualizer({
            filename: 'dist/stats.html',
            open: true,
            gzipSize: true,
            brotliSize: true
        })
    ],

    // Build optimizations
    build: {
        // Code splitting and chunking strategy
        rollupOptions: {
            output: {
                // Manual chunk splitting for better caching
                manualChunks: {
                    // Vendor libraries
                    'vendor-react': ['react', 'react-dom'],
                    'vendor-router': ['react-router-dom'],
                    'vendor-ui': ['react-toastify', 'react-select', 'react-phone-input-2'],
                    'vendor-icons': ['@fortawesome/react-fontawesome', '@fortawesome/free-solid-svg-icons', '@fortawesome/free-brands-svg-icons'],
                    'vendor-charts': ['recharts'],
                    'vendor-cloudinary': ['@cloudinary/react', '@cloudinary/url-gen'],
                    'vendor-utils': ['date-fns', 'xlsx'],
                },
                // Add hashes to chunk names for better caching
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: (assetInfo) => {
                    const info = assetInfo.name.split('.')
                    const ext = info[info.length - 1]
                    if (/\.(css)$/.test(assetInfo.name)) {
                        return `assets/css/[name]-[hash][extname]`
                    }
                    if (/\.(png|jpe?g|svg|gif|webp|avif)$/.test(assetInfo.name)) {
                        return `assets/images/[name]-[hash][extname]`
                    }
                    if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
                        return `assets/fonts/[name]-[hash][extname]`
                    }
                    return `assets/[ext]/[name]-[hash][extname]`
                }
            }
        },

        // Optimization settings
        target: 'es2015',
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info'],
                passes: 2
            },
            mangle: {
                safari10: true
            },
            format: {
                comments: false
            }
        },

        // CSS code splitting
        cssCodeSplit: true,

        // Source maps for production debugging (can be disabled for smaller bundles)
        sourcemap: false,

        // Chunk size warning limit
        chunkSizeWarningLimit: 1000,

        // Asset inlining threshold
        assetsInlineLimit: 4096,

        // Enable CSS minification
        cssMinify: true
    },

    // Development server optimizations
    server: {
        // Enable HTTP/2
        https: false,
        // Compression
        cors: true,
        // Pre-bundle dependencies
        force: true
    },

    // Dependency optimization
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            '@cloudinary/react',
            '@cloudinary/url-gen',
            'react-toastify',
            'date-fns'
        ],
        // Force pre-bundling of large dependencies
        force: true
    },

    // Asset handling
    assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.webp'],

    // Define global constants for better tree shaking
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
        __DEV__: process.env.NODE_ENV !== 'production'
    },

    // Resolve configuration
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            '@components': resolve(__dirname, 'src/components'),
            '@assets': resolve(__dirname, 'src/assets'),
            '@services': resolve(__dirname, 'src/services'),
            '@hooks': resolve(__dirname, 'src/hooks'),
            '@contexts': resolve(__dirname, 'src/contexts'),
            '@config': resolve(__dirname, 'src/config')
        }
    }
})
