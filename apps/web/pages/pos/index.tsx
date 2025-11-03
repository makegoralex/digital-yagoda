import Head from 'next/head';

export default function PosHome() {
  return (
    <>
      <Head>
        <title>POS — Быстрый старт</title>
      </Head>
      <main
        style={{
          display: 'grid',
          placeItems: 'center',
          minHeight: '100vh',
          padding: '2rem',
          background: '#0f172a',
          color: '#f8fafc'
        }}
      >
        <div style={{ maxWidth: '540px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>POS-экран в разработке</h1>
          <p style={{ fontSize: '1.125rem', lineHeight: 1.6 }}>
            Здесь появится планшетный интерфейс кассы с поддержкой офлайн-режима. Используйте меню
            приложения для навигации или добавьте ярлык на главный экран устройства.
          </p>
        </div>
      </main>
    </>
  );
}
