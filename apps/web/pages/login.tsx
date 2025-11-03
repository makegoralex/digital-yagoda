import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';

import { PrimaryButton } from '@digital-yagoda/ui';

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>();
  const [apiError, setApiError] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null);
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const data = await response.json();
        setApiError(data.message ?? 'Не удалось войти');
        return;
      }

      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('companyId', data.user.companyId);
      await router.push('/switch');
    } catch (error) {
      setApiError('Ошибка соединения');
    }
  });

  return (
    <>
      <Head>
        <title>Вход в POS — Ягода</title>
      </Head>
      <main
        style={{
          display: 'grid',
          minHeight: '100vh',
          placeItems: 'center',
          padding: '2rem'
        }}
      >
        <section
          style={{
            width: '100%',
            maxWidth: '420px',
            backgroundColor: '#ffffff',
            borderRadius: '1.5rem',
            boxShadow: '0 20px 45px rgba(15, 23, 42, 0.15)',
            padding: '2.5rem'
          }}
        >
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>С возвращением!</h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Введите корпоративный email и пароль, чтобы продолжить.
          </p>

          <form onSubmit={onSubmit} style={{ marginTop: '2rem', display: 'grid', gap: '1.25rem' }}>
            <label style={{ display: 'grid', gap: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>Email</span>
              <input
                type="email"
                {...register('email', { required: 'Укажите email' })}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #d1d5db',
                  fontSize: '1rem'
                }}
              />
              {errors.email ? (
                <span role="alert" style={{ color: '#dc2626' }}>
                  {errors.email.message}
                </span>
              ) : null}
            </label>

            <label style={{ display: 'grid', gap: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>Пароль</span>
              <input
                type="password"
                {...register('password', { required: 'Введите пароль', minLength: 8 })}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #d1d5db',
                  fontSize: '1rem'
                }}
              />
              {errors.password ? (
                <span role="alert" style={{ color: '#dc2626' }}>
                  {errors.password.message ?? 'Минимум 8 символов'}
                </span>
              ) : null}
            </label>

            {apiError ? (
              <div role="alert" style={{ color: '#dc2626' }}>
                {apiError}
              </div>
            ) : null}

            <PrimaryButton
              type="submit"
              label={isSubmitting ? 'Входим…' : 'Войти'}
              disabled={isSubmitting}
            />
          </form>
        </section>
      </main>
    </>
  );
}
