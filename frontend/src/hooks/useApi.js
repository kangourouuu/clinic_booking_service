import { useState, useEffect, useCallback, useRef } from 'react'

// Generic hook for API calls
export const useApi = (apiCall, dependencies = []) => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const cancelTokenRef = useRef()

    const fetchData = useCallback(async (...args) => {
        try {
            setLoading(true)
            setError(null)

            const result = await apiCall(...args)
            setData(result)
        } catch (err) {
            setError(err)
        } finally {
            setLoading(false)
        }
    }, dependencies)

    useEffect(() => {
        fetchData()

        return () => {
            if (cancelTokenRef.current) {
                cancelTokenRef.current.cancel('Component unmounted')
            }
        }
    }, [fetchData])

    const refetch = useCallback((...args) => {
        return fetchData(...args)
    }, [fetchData])

    return { data, loading, error, refetch }
}

// Hook for pagination
export const usePagination = (fetchFunction, initialPage = 1, initialLimit = 10) => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(initialPage)
    const [limit, setLimit] = useState(initialLimit)
    const [totalPages, setTotalPages] = useState(0)
    const [totalItems, setTotalItems] = useState(0)
    const [hasMore, setHasMore] = useState(false)

    const fetchData = useCallback(async (currentPage = page, currentLimit = limit, reset = false) => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetchFunction(currentPage, currentLimit)

            if (reset || currentPage === 1) {
                setData(response.data || [])
            } else {
                setData(prev => [...prev, ...(response.data || [])])
            }

            setTotalPages(response.totalPages || 0)
            setTotalItems(response.totalItems || 0)
            setHasMore(currentPage < (response.totalPages || 0))

        } catch (err) {
            setError(err)
        } finally {
            setLoading(false)
        }
    }, [fetchFunction, page, limit])

    useEffect(() => {
        fetchData(1, limit, true)
    }, [limit])

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            const nextPage = page + 1
            setPage(nextPage)
            fetchData(nextPage, limit, false)
        }
    }, [page, limit, loading, hasMore, fetchData])

    const refresh = useCallback(() => {
        setPage(1)
        fetchData(1, limit, true)
    }, [limit, fetchData])

    const goToPage = useCallback((newPage) => {
        setPage(newPage)
        fetchData(newPage, limit, true)
    }, [limit, fetchData])

    return {
        data,
        loading,
        error,
        page,
        limit,
        totalPages,
        totalItems,
        hasMore,
        setLimit,
        loadMore,
        refresh,
        goToPage
    }
}

// Hook for form handling with validation
export const useForm = (initialValues, validationSchema) => {
    const [values, setValues] = useState(initialValues)
    const [errors, setErrors] = useState({})
    const [touched, setTouched] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const validateField = useCallback((name, value) => {
        if (validationSchema && validationSchema[name]) {
            try {
                validationSchema[name](value)
                return null
            } catch (error) {
                return error.message
            }
        }
        return null
    }, [validationSchema])

    const validateAll = useCallback(() => {
        const newErrors = {}

        Object.keys(values).forEach(name => {
            const error = validateField(name, values[name])
            if (error) {
                newErrors[name] = error
            }
        })

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }, [values, validateField])

    const handleChange = useCallback((name, value) => {
        setValues(prev => ({ ...prev, [name]: value }))

        if (touched[name]) {
            const error = validateField(name, value)
            setErrors(prev => ({ ...prev, [name]: error }))
        }
    }, [touched, validateField])

    const handleBlur = useCallback((name) => {
        setTouched(prev => ({ ...prev, [name]: true }))

        const error = validateField(name, values[name])
        setErrors(prev => ({ ...prev, [name]: error }))
    }, [values, validateField])

    const handleSubmit = useCallback(async (onSubmit) => {
        const isValid = validateAll()

        if (isValid) {
            setIsSubmitting(true)
            try {
                await onSubmit(values)
            } catch (error) {
                console.error('Form submission error:', error)
            } finally {
                setIsSubmitting(false)
            }
        } else {
            // Mark all fields as touched to show errors
            const allTouched = {}
            Object.keys(values).forEach(key => {
                allTouched[key] = true
            })
            setTouched(allTouched)
        }
    }, [values, validateAll])

    const reset = useCallback(() => {
        setValues(initialValues)
        setErrors({})
        setTouched({})
        setIsSubmitting(false)
    }, [initialValues])

    return {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
        reset,
        setValues,
        isValid: Object.keys(errors).length === 0
    }
}

// Hook for debounced search
export const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}
