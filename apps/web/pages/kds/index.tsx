import Head from 'next/head';

export default function KdsPlaceholder() {
  return (
    <>
      <Head>
        <title>KDS — Очередь заказов</title>
      </Head>
      <main
        style={{
          minHeight: '100vh',
          background: '#111827',
          color: '#f8fafc',
          display: 'grid',
          placeItems: 'center',
          padding: '2rem'
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '640px' }}>
          <h1 style={{ fontSize: '2.75rem', marginBottom: '1rem' }}>KDS скоро будет доступен</h1>
          <p style={{ fontSize: '1.125rem', lineHeight: 1.6 }}>
            Экран кухни будет отображать заказы в реальном времени через WebSocket. Он будет адаптирован
            под большие дисплеи и поддерживать фильтры по линиям.
          </p>
        </div>
      </main>
    </>
  );
}
