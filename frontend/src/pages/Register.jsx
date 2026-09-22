import { useState } from 'react'

function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })

  const [message, setMessage] = useState('')

  /** @type {[Record<string, string[]>, Function]} */
  const [errors, setErrors] = useState({})

  /**
   * Обрабатывает изменение поля формы.
   *
   * @param {import('react').ChangeEvent<HTMLInputElement>} event
   */
  function handleChange(event) {
    const { name, value } = event.target

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }))
  }

  /**
   * Отправляет форму регистрации в Laravel API.
   *
   * @param {import('react').FormEvent<HTMLFormElement>} event
   */
  async function handleSubmit(event) {
    event.preventDefault()

    setErrors({})
    setMessage('Регистрация...')

    try {
      const response = await fetch('http://localhost:8000/api/register', {
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
        setMessage(data.message || 'Ошибка регистрации')

        if (data.errors) {
          setErrors(data.errors)
        }

        return
      }

      setMessage('Регистрация выполнена успешно')

      setForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
      })
    } catch (error) {
      console.error('Request error:', error)
      setMessage('Не удалось подключиться к серверу')
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Регистрация</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Имя</label>

            <input
              id="name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Введите имя"
              required
            />
          </div>

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

          <div className="form-group">
            <label htmlFor="password_confirmation">
              Подтверждение пароля
            </label>

            <input
              id="password_confirmation"
              type="password"
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={handleChange}
              placeholder="Повторите пароль"
              required
            />
          </div>

          <button type="submit">
            Зарегистрироваться
          </button>
        </form>

        {message && <p>{message}</p>}

        {Object.entries(errors).map(([field, messages]) => (
          <div key={field}>
            {messages.map((errorMessage) => (
              <p key={errorMessage}>{errorMessage}</p>
            ))}
          </div>
        ))}
      </div>
    </main>
  )
}

export default Register