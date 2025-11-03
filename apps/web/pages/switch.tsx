import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface Branch {
  id: string;
  name: string;
  code?: string;
}

export default function SwitchContextPage() {
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      void router.replace('/login');
      return;
    }

    async function loadBranches() {
      try {
        const response = await fetch('/api/v1/branches', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error('Не удалось загрузить точки');
        }
        const data = await response.json();
        setBranches(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    void loadBranches();
  }, [router]);

  const handleSelect = async (branchId: string) => {
    localStorage.setItem('branchId', branchId);
    await router.push('/admin/dashboard');
  };

  return (
    <>
      <Head>
        <title>Выбор точки — Ягода</title>
      </Head>
      <main
        style={{
          minHeight: '100vh',
          padding: '2rem',
          maxWidth: '960px',
          margin: '0 auto'
        }}
      >
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Выберите точку</h1>
          <p style={{ color: '#6b7280' }}>Это определит меню и графики для интерфейсов.</p>
        </header>

        {loading ? <p>Загрузка…</p> : null}
        {error ? (
          <p role="alert" style={{ color: '#dc2626' }}>
            {error}
          </p>
        ) : null}

        <section
          role="list"
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
          }}
        >
          {branches.map((branch) => (
            <button
              key={branch.id}
              onClick={() => handleSelect(branch.id)}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '1rem',
                backgroundColor: '#ffffff',
                padding: '1.5rem',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>{branch.name}</span>
              {branch.code ? (
                <span style={{ display: 'block', color: '#6b7280', marginTop: '0.5rem' }}>
                  Код: {branch.code}
                </span>
              ) : null}
            </button>
          ))}
        </section>
      </main>
    </>
  );
}
