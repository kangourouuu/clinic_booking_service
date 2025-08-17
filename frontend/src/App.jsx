import React from 'react'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import AppRoutes from './routes/AppRoutes'
import useTestModeShortcuts from './hooks/useTestModeShortcuts'

function App() {
    useTestModeShortcuts()

    return (
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
    )
}

export default App
