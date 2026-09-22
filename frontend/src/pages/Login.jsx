import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [message, setMessage] = useState('')

  function handleChange(event) {
    const { name, value } = event.target

    setForm({
      ...form,
      [name]: value,
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setMessage('Вход...')

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      console.log('HTTP status:', response.status)
      console.log('API response:', data)

      if (!response.ok) {
        setMessage(data.message || 'Ошибка входа')
        return
      }

      await login(data.token, data.user)

      setMessage('Вход выполнен успешно')

      navigate('/')
    } catch (error) {
      console.error('Request error:', error)
      setMessage('Не удалось подключиться к серверу')
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Вход</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Введите email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>

            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Введите пароль"
              required
            />
          </div>

          <button type="submit">
            Войти
          </button>
        </form>

        {message && <p>{message}</p>}
      </div>
    </main>
  )
}

export default Login