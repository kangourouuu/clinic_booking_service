import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import AppRoutes from './routes/AppRoutes'
import useTestModeShortcuts from './hooks/useTestModeShortcuts'

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            cacheTime: 1000 * 60 * 10, // 10 minutes
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
})

function App() {
    useTestModeShortcuts()

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <div className="App">
                    <AppRoutes />
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#363636',
                                color: '#fff',
                            },
                            success: {
                                duration: 3000,
                                theme: {
                                    primary: 'green',
                                    secondary: 'black',
                                },
                            },
                        }}
                    />
                </div>
            </AuthProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}

export default App
