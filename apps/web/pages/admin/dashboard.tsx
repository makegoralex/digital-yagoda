import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface CompanyInfo {
  name: string;
  slug: string;
  plan: string;
  timezone: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      void router.replace('/login');
      return;
    }

    async function loadCompany() {
      try {
        const response = await fetch('/api/v1/companies', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error('Не удалось загрузить компанию');
        }
        const data = await response.json();
        setCompany(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    void loadCompany();
  }, [router]);

  return (
    <>
      <Head>
        <title>Админ-панель — Ягода</title>
      </Head>
      <main style={{ padding: '2rem', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Обзор компании</h1>
          <p style={{ color: '#6b7280' }}>Быстрый доступ к ключевым настройкам и статусу.</p>
        </header>

        {loading ? <p>Загрузка…</p> : null}
        {error ? (
          <p role="alert" style={{ color: '#dc2626' }}>
            {error}
          </p>
        ) : null}

        {company ? (
          <section
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '1.5rem',
              padding: '2rem',
              boxShadow: '0 18px 35px rgba(15, 23, 42, 0.1)',
              display: 'grid',
              gap: '1rem'
            }}
          >
            <div>
              <span style={{ color: '#6b7280' }}>Компания</span>
              <h2 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem' }}>{company.name}</h2>
            </div>
            <div>
              <span style={{ color: '#6b7280' }}>План</span>
              <p style={{ margin: 0, fontWeight: 600 }}>{company.plan}</p>
            </div>
            <div>
              <span style={{ color: '#6b7280' }}>Slug для white-label</span>
              <p style={{ margin: 0 }}>{company.slug}</p>
            </div>
            <div>
              <span style={{ color: '#6b7280' }}>Часовой пояс</span>
              <p style={{ margin: 0 }}>{company.timezone}</p>
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}
