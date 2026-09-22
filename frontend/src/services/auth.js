import api from './api';

export const register = async (name, email, password) => {
    const response = await api.post('/register', {
        name,
        email,
        password,
    });

    return response.data;
};