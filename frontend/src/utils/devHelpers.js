// Development URLs for quick testing:

// Patient login
// http://localhost:3000/patient/login?dev=patient&phone_number=0123456789&password=123456

// Nurse login  
// http://localhost:3000/nurse/login?dev=nurse&phone_number=0123456788&password=123456

// Doctor login
// http://localhost:3000/doctor/login?dev=doctor&phone_number=0123456787&password=123456

// Clear storage and go to role selector
// http://localhost:3000/auth/login?clear=true

export const handleDevParams = () => {
    if (process.env.NODE_ENV !== 'development') return

    const urlParams = new URLSearchParams(window.location.search)

    // Clear storage parameter
    if (urlParams.get('clear') === 'true') {
        localStorage.clear()
        sessionStorage.clear()
        document.cookie.split(";").forEach(function (c) {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        })
        // Remove parameter and reload
        const newUrl = window.location.pathname
        window.history.replaceState({}, document.title, newUrl)
        window.location.reload()
        return
    }

    // Auto-fill login forms for development
    const devRole = urlParams.get('dev')
    const phone_number = urlParams.get('phone_number')
    const password = urlParams.get('password')

    if (devRole && phone_number && password) {
        setTimeout(() => {
            const phoneInput = document.querySelector('input[name="phone_number"]')
            const passwordInput = document.querySelector('input[name="password"]')

            if (phoneInput && passwordInput) {
                phoneInput.value = phone_number
                passwordInput.value = password

                // Trigger change events
                const changeEvent = new Event('input', { bubbles: true })
                phoneInput.dispatchEvent(changeEvent)
                passwordInput.dispatchEvent(changeEvent)
            }
        }, 100)
    }
}

export default handleDevParams
