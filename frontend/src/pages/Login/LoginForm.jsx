import React, { useState } from 'react';
import useLogin from './useLogin';
import Input from '../../components/form/Input';
import Button from '../../components/ui/Button';

const LoginForm = () => {
    const { login } = useLogin();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        login(username, password);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Input label="Username" value={username} onChange={e => setUsername(e.target.value)} />
            <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <Button type="submit">Login</Button>
        </form>
    );
};

export default LoginForm;