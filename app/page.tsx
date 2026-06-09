import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{background: '#0A0F2E'}}>
      {/* Flag bar top */}
      <div className="h-1 w-full flex">
        <div className="flex-1" style={{background: '#0038A8'}}></div>
        <div className="flex-1" style={{background: '#FCD116'}}></div>
        <div className="flex-1" style={{background: '#CE1126'}}></div>
      </div>

      {/* Nav */}
      <nav className="px-5 py-3 flex items-center justify-between" style={{background: '#0D1535', borderBottom: '1px solid #1E2D5A'}}>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-base"
            style={{background: 'linear-gradient(135deg, #CE1126, #0038A8)'}}>
            B
          </div>
          <div>
            <div className="font-bold text-sm" style={{color: '#FCD116'}}>Bayanihan</div>
            <div className="text-xs" style={{color: '#A0AEC0'}}>Para sa mga Pilipino 🇵🇭</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/auth/login" className="text-sm font-medium px-3 py-1.5 rounded-lg border"
            style={{color: '#FCD116', borderColor: '#FCD116'}}>
            Login
          </Link>
          <Link href="/auth/signup" className="text-sm font-medium px-3 py-1.5 rounded-lg text-white font-bold"
            style={{background: '#CE1126'}}>
            Libre →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-12 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6"
          style={{background: '#1A2550', color: '#FCD116', border: '1px solid #FCD116'}}>
          🇵🇭 Para sa mga Pilipino
        </div>

        <h1 className="text-3xl md:text-5xl font-bold max-w-xl leading-tight mb-4" style={{color: '#FFFFFF'}}>
          Mula sa notebook,<br />
          <span style={{color: '#CE1126'}}>dalhin natin</span>{' '}
          <span style={{color: '#FCD116'}}>ang bayanihan</span><br />
          <span style={{color: '#5B8BFF'}}>sa digital age.</span>
        </h1>

        <p className="text-sm md:text-base max-w-md mb-8 leading-relaxed" style={{color: '#A0AEC0'}}>
          I-track ang contributions, funds, at bills ng inyong paluwagan o kooperatiba.
          Transparent. Simple. <span style={{color: '#FCD116', fontWeight: 'bold'}}>Libre magsimula.</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none justify-center">
          <Link href="/auth/signup"
            className="px-8 py-3 rounded-xl text-white font-bold text-sm"
            style={{background: 'linear-gradient(135deg, #CE1126, #8B0000)'}}>
            Magsimula nang libre 🇵🇭
          </Link>
          <Link href="/auth/login"
            className="px-8 py-3 rounded-xl font-bold text-sm border-2"
            style={{color: '#FCD116', borderColor: '#FCD116', background: 'transparent'}}>
            Mag-login
          </Link>
        </div>

        {/* Pricing pills */}
        <div className="flex flex-wrap gap-2 justify-center mt-10">
          {[
            { name: 'Free', desc: '10 members · ₱0', bg: '#1A2550', color: '#5B8BFF' },
            { name: 'Starter', desc: '30 members · ₱200/mo', bg: '#2D1A1A', color: '#FF6B6B' },
            { name: 'Pro', desc: '80 members · ₱1,299/mo', bg: '#0038A8', color: '#FCD116' },
            { name: 'Elite', desc: 'Unlimited · ₱2,999/mo', bg: '#CE1126', color: '#FCD116' },
          ].map(p => (
            <div key={p.name} className="px-3 py-1.5 rounded-full text-xs font-bold"
              style={{background: p.bg, color: p.color, border: `1px solid ${p.color}33`}}>
              {p.name} — {p.desc}
            </div>
          ))}
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-10 max-w-lg w-full text-left">
          {[
            { icon: '👥', title: 'Member tracker', desc: 'Lahat ng miyembro at kanilang records', bg: '#1A2550', color: '#5B8BFF' },
            { icon: '💰', title: 'Fund overview', desc: 'Total fund, collected, at pending', bg: '#2D1A1A', color: '#FF6B6B' },
            { icon: '📋', title: 'Bills tracker', desc: 'Lahat ng scheduled payments', bg: '#2D2500', color: '#FCD116' },
            { icon: '🏦', title: 'Loan management', desc: 'Request, approve, at i-track', bg: '#1A2550', color: '#5B8BFF' },
            { icon: '📱', title: 'SMS reminders', desc: 'Auto-remind sa overdue members', bg: '#2D1A1A', color: '#FF6B6B' },
            { icon: '📊', title: 'PDF reports', desc: 'Monthly report para sa treasurer', bg: '#2D2500', color: '#FCD116' },
          ].map(f => (
            <div key={f.title} className="rounded-xl p-3" style={{background: f.bg, border: `1px solid ${f.color}33`}}>
              <div className="text-xl mb-1">{f.icon}</div>
              <div className="font-bold text-xs mb-0.5" style={{color: f.color}}>{f.title}</div>
              <div className="text-xs" style={{color: '#718096'}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer flag bar */}
      <div className="h-1 w-full flex">
        <div className="flex-1" style={{background: '#CE1126'}}></div>
        <div className="flex-1" style={{background: '#FCD116'}}></div>
        <div className="flex-1" style={{background: '#0038A8'}}></div>
      </div>
      <footer className="text-center py-4 text-xs" style={{background: '#0D1535', color: '#4A5568'}}>
        © 2025 Bayanihan · Community Savings Platform para sa mga Pilipino 🇵🇭
      </footer>
    </div>
  )
}
