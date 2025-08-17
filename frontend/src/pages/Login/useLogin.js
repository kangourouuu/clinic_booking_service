const useLogin = () => {
    const login = (username, password) => {
        console.log(`Logging in with`, { username, password });
        // Call API here
    };

    return { login };
};

export default useLogin;