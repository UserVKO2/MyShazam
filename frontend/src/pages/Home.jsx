import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Home() {
    const navigate = useNavigate();

    const [health, setHealth] = useState(null);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get('/health')
            .then((response) => {
                setHealth(response.data);
            })
            .catch((error) => {
                console.error(error);
                setError('Не удалось подключиться к Laravel');
            });

        api.get('/user')
            .then((response) => {
                setUser(response.data);
            })
            .catch((error) => {
                console.error(error);
                setError('Не удалось получить данные пользователя');
            });
    }, []);

    async function handleLogout() {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            navigate('/login');
        }
    }

    return (
        <main>
            <h1>Shazam</h1>
            <p>Главная страница</p>

            {health && (
                <div>
                    <p>Backend: {health.status}</p>
                    <p>Service: {health.service}</p>
                </div>
            )}

            {user && (
                <div>
                    <h2>Пользователь</h2>
                    <p>ID: {user.id}</p>
                    <p>Имя: {user.name}</p>
                    <p>Email: {user.email}</p>
                </div>
            )}

            {error && <p>{error}</p>}

            <button onClick={handleLogout}>
                Выйти
            </button>
        </main>
    );
}

export default Home;