import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{background: '#0B1F3A', minHeight: '100vh', fontFamily: "'Inter', 'Poppins', sans-serif", color: '#FFFFFF'}}>

      {/* Nav - logo only, no buttons */}
      <nav style={{background: '#0B1F3A', borderBottom: '1px solid #1A3A5C', padding: '16px 24px', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <div style={{width: '36px', height: '36px', background: '#D4A017', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#0B1F3A', fontSize: '16px'}}>C</div>
          <div>
            <div style={{fontWeight: '700', fontSize: '15px', color: '#FFFFFF', letterSpacing: '-0.3px'}}>CommunityFlow</div>
            <div style={{fontSize: '10px', color: '#D6DCE5'}}>Simple. Transparent. Connected.</div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{textAlign: 'center', padding: '72px 24px 56px'}}>
        <div style={{display: 'inline-block', background: '#132D4E', color: '#D4A017', fontSize: '11px', fontWeight: '600', padding: '5px 14px', borderRadius: '20px', marginBottom: '24px', letterSpacing: '0.08em', textTransform: 'uppercase'}}>
          Community Management Platform
        </div>
        <h1 style={{fontSize: 'clamp(28px, 6vw, 52px)', fontWeight: '700', lineHeight: '1.15', marginBottom: '20px', maxWidth: '640px', margin: '0 auto 20px', letterSpacing: '-1px'}}>
          Manage your community,<br />
          <span style={{color: '#D4A017'}}>Funds, and Records</span><br />
          in one place.
        </h1>
        <p style={{fontSize: '15px', color: '#D6DCE5', maxWidth: '480px', margin: '0 auto 36px', lineHeight: '1.7'}}>
          A modern platform for member management, contributions, payments, and financial tracking. Simple. Transparent. Connected.
        </p>
        <div style={{display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap'}}>
          <Link href="/auth/signup" style={{background: '#D4A017', color: '#0B1F3A', fontWeight: '700', fontSize: '14px', padding: '13px 28px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block'}}>
            Start Free
          </Link>
          <Link href="/auth/login" style={{background: 'transparent', color: '#FFFFFF', fontWeight: '500', fontSize: '14px', padding: '13px 28px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block', border: '1px solid #2A4A6C'}}>
            Login
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{padding: '48px 24px', maxWidth: '960px', margin: '0 auto'}}>
        <h2 style={{textAlign: 'center', fontSize: '22px', fontWeight: '700', marginBottom: '8px'}}>Everything your community needs</h2>
        <p style={{textAlign: 'center', color: '#D6DCE5', fontSize: '14px', marginBottom: '36px'}}>Built for Cooperatives and Community Organizations.</p>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px'}}>
          {[
            { title: 'Member Management', desc: 'Track all members, roles, and membership history in one organized dashboard.' },
            { title: 'Fund Overview', desc: 'Real-time visibility into total funds, collections, and pending payments.' },
            { title: 'Payment Tracking', desc: 'Record and monitor every contribution with full transaction history.' },
            { title: 'Loan Management', desc: 'Handle loan requests, approvals, and repayment schedules with ease.' },
            { title: 'Reports & Analytics', desc: 'Generate monthly PDF reports for transparency and compliance.' },
            { title: 'Overdue Alerts', desc: 'Automatic notifications for overdue members and pending collections.' },
          ].map(f => (
            <div key={f.title} style={{background: '#FFFFFF', borderRadius: '12px', padding: '20px', color: '#0B1F3A'}}>
              <div style={{width: '32px', height: '3px', background: '#D4A017', borderRadius: '2px', marginBottom: '12px'}}></div>
              <div style={{fontWeight: '600', fontSize: '14px', marginBottom: '6px'}}>{f.title}</div>
              <div style={{fontSize: '13px', color: '#4A5568', lineHeight: '1.6'}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section style={{padding: '48px 24px', maxWidth: '960px', margin: '0 auto'}}>
        <h2 style={{textAlign: 'center', fontSize: '22px', fontWeight: '700', marginBottom: '8px'}}>Simple pricing</h2>
        <p style={{textAlign: 'center', color: '#D6DCE5', fontSize: '14px', marginBottom: '36px'}}>Start free. Upgrade as your group grows.</p>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px'}}>
          {[
            { name: 'Free', price: '₱0', period: 'forever', members: 'Up to 10 Members', features: ['Member tracker', 'Fund overview', 'Payment history'], highlight: false },
            { name: 'Starter', price: '₱200', period: '/month', members: 'Up to 30 Members', features: ['Everything in Free', 'Bills tracker', 'Overdue alerts', 'Group announcements'], highlight: false },
            { name: 'Pro', price: '₱1,299', period: '/month', members: 'Up to 80 Members', features: ['Everything in Starter', 'Loan management', 'Loan calculator', 'SMS reminders', 'PDF reports'], highlight: true },
            { name: 'Elite', price: '₱2,999', period: '/month', members: 'Unlimited Members', features: ['Everything in Pro', 'AI features', 'White-label', 'Multi-group', 'GCash QR', 'Priority support'], highlight: false },
          ].map(p => (
            <div key={p.name} style={{
              background: p.highlight ? '#D4A017' : '#FFFFFF',
              borderRadius: '12px', padding: '24px',
              color: '#0B1F3A',
              border: p.highlight ? 'none' : '1px solid #E2E8F0',
              position: 'relative'
            }}>
              {p.highlight && <div style={{position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#0B1F3A', color: '#D4A017', fontSize: '10px', fontWeight: '700', padding: '3px 12px', borderRadius: '20px', whiteSpace: 'nowrap'}}>MOST POPULAR</div>}
              <div style={{fontWeight: '700', fontSize: '16px', marginBottom: '4px'}}>{p.name}</div>
              <div style={{fontSize: '24px', fontWeight: '700', marginBottom: '2px'}}>{p.price}<span style={{fontSize: '12px', fontWeight: '400'}}>{p.period}</span></div>
              <div style={{fontSize: '12px', marginBottom: '16px', opacity: 0.7}}>{p.members}</div>
              <div style={{borderTop: `1px solid ${p.highlight ? '#0B1F3A22' : '#E2E8F0'}`, paddingTop: '14px'}}>
                {p.features.map(f => (
                  <div key={f} style={{fontSize: '12px', padding: '3px 0', display: 'flex', alignItems: 'center', gap: '6px'}}>
                    <span style={{color: p.highlight ? '#0B1F3A' : '#D4A017', fontWeight: '700'}}>✓</span> {f}
                  </div>
                ))}
              </div>
              <Link href="/auth/signup" style={{display: 'block', textAlign: 'center', marginTop: '16px', background: p.highlight ? '#0B1F3A' : '#D4A017', color: p.highlight ? '#D4A017' : '#0B1F3A', fontWeight: '700', fontSize: '13px', padding: '10px', borderRadius: '7px', textDecoration: 'none'}}>
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{borderTop: '1px solid #1A3A5C', padding: '24px', textAlign: 'center', color: '#D6DCE5', fontSize: '12px', marginTop: '24px'}}>
        © 2026 CommunityFlow · Community Management Platform
      </footer>
    </div>
  )
}
