import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

const useWebSocket = (url, options = {}) => {
    const [isConnected, setIsConnected] = useState(false)
    const [lastMessage, setLastMessage] = useState(null)
    const [error, setError] = useState(null)
    const wsRef = useRef(null)
    const { token } = useAuth()

    const {
        onMessage,
        onOpen,
        onClose,
        onError,
        reconnectAttempts = 3,
        reconnectInterval = 10000, // Tăng từ 3s lên 10s
        shouldReconnect = true
    } = options

    const reconnectAttemptsRef = useRef(0)
    const reconnectTimeoutRef = useRef(null)
    const initializedRef = useRef(false)

    const connect = useCallback(() => {
        try {
            // Prevent multiple connections
            if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
                console.log('WebSocket: Connection already connecting, skipping...')
                return
            }

            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                console.log('WebSocket: Connection already open, skipping...')
                return
            }

            // Close any existing connection
            if (wsRef.current) {
                wsRef.current.close()
                wsRef.current = null
            }

            // Add authentication token to WebSocket URL if available
            const wsUrl = token
                ? `${url}?token=${encodeURIComponent(token)}`
                : url

            console.log('WebSocket: Connecting to', wsUrl)

            wsRef.current = new WebSocket(wsUrl)

            wsRef.current.onopen = (event) => {
                console.log('WebSocket: Connected')
                setIsConnected(true)
                setError(null)
                reconnectAttemptsRef.current = 0
                onOpen?.(event)
            }

            wsRef.current.onmessage = (event) => {
                console.log('WebSocket: Message received', event.data)
                try {
                    const data = JSON.parse(event.data)
                    setLastMessage(data)
                    onMessage?.(data)
                } catch (err) {
                    console.error('WebSocket: Error parsing message', err)
                    setLastMessage(event.data)
                    onMessage?.(event.data)
                }
            }

            wsRef.current.onclose = (event) => {
                console.log('WebSocket: Disconnected', event.code, event.reason)
                console.trace('WebSocket close stack trace') // Debug: xem ai gọi close
                setIsConnected(false)
                wsRef.current = null // Clear reference immediately
                onClose?.(event)

                // Attempt to reconnect if enabled and not a deliberate close
                if (shouldReconnect && event.code !== 1000 && reconnectAttemptsRef.current < reconnectAttempts) {
                    reconnectAttemptsRef.current++
                    console.log(`WebSocket: Reconnecting... Attempt ${reconnectAttemptsRef.current}/${reconnectAttempts}`)

                    // Exponential backoff: 10s, 20s, 40s
                    const backoffDelay = reconnectInterval * Math.pow(2, reconnectAttemptsRef.current - 1)

                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect()
                    }, backoffDelay)
                }
            }

            wsRef.current.onerror = (event) => {
                console.error('WebSocket: Error', event)
                setError(event)
                onError?.(event)
            }

        } catch (err) {
            console.error('WebSocket: Connection error', err)
            setError(err)
        }
    }, [url, token, onMessage, onOpen, onClose, onError, shouldReconnect, reconnectAttempts, reconnectInterval])

    const disconnect = useCallback(() => {
        console.log('WebSocket: disconnect() called')
        console.trace('WebSocket disconnect stack trace') // Debug: xem ai gọi disconnect

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
        }

        if (wsRef.current) {
            if (wsRef.current.readyState === WebSocket.OPEN) {
                console.log('WebSocket: Closing connection...')
                wsRef.current.close(1000, 'Disconnected by user')
            }
            wsRef.current = null // Clean up reference
        }

        setIsConnected(false)
    }, [])

    const sendMessage = useCallback((message) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const messageString = typeof message === 'string' ? message : JSON.stringify(message)
            console.log('WebSocket: Sending message', messageString)
            wsRef.current.send(messageString)
            return true
        } else {
            console.warn('WebSocket: Cannot send message, connection not open')
            return false
        }
    }, [])

    const reconnect = useCallback(() => {
        console.log('WebSocket: Manual reconnect triggered')
        reconnectAttemptsRef.current = 0 // Reset attempts
        disconnect()
        setTimeout(() => {
            connect()
        }, 1000)
    }, [disconnect, connect])

    useEffect(() => {
        if (!initializedRef.current) {
            console.log('WebSocket: useEffect called - initializing connection')
            initializedRef.current = true

            // Add small delay in development to avoid Hot Refresh conflicts
            const delay = process.env.NODE_ENV === 'development' ? 1000 : 0
            setTimeout(() => {
                connect()
            }, delay)
        }

        return () => {
            console.log('WebSocket: useEffect cleanup - disconnecting')
            initializedRef.current = false
            disconnect()
        }
    }, [url, token]) // Chỉ depend on url và token, không depend on connect/disconnect

    return {
        isConnected,
        lastMessage,
        error,
        sendMessage,
        connect,
        disconnect,
        reconnect
    }
}

export default useWebSocket
