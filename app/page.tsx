import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1D9E75] rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">B</span>
          </div>
          <span className="font-semibold text-[#085041]">Bayanihan</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2">
            Sign in
          </Link>
          <Link href="/auth/signup" className="bg-[#1D9E75] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#085041] transition-colors">
            Subukan nang libre
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-[#E1F5EE] text-[#085041] text-xs font-medium px-3 py-1 rounded-full mb-6">
          ✦ Para sa mga Pilipino
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold text-[#1A1A18] max-w-2xl leading-tight mb-4">
          Mula sa notebook,<br />
          <span className="text-[#1D9E75]">dalhin natin ang bayanihan</span><br />
          sa digital age.
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mb-10 leading-relaxed">
          I-track ang contributions, funds, at bills ng inyong paluwagan o kooperatiba. 
          Transparent. Simple. Libre magsimula.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/auth/signup" className="bg-[#1D9E75] text-white px-8 py-3 rounded-lg hover:bg-[#085041] transition-colors font-medium text-base">
            Magsimula nang libre →
          </Link>
          <Link href="/auth/login" className="border border-gray-200 bg-white text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium text-base">
            Mag-login
          </Link>
        </div>

        {/* Pricing pills */}
        <div className="flex flex-wrap gap-3 justify-center mt-14">
          {[
            { name: 'Free', desc: '10 members · ₱0', color: 'bg-[#E1F5EE] text-[#085041]' },
            { name: 'Starter', desc: '30 members · ₱200/mo', color: 'bg-[#E6F1FB] text-[#0C447C]' },
            { name: 'Pro', desc: '80 members · ₱1,299/mo', color: 'bg-[#EEEDFE] text-[#26215C]' },
            { name: 'Elite', desc: 'Unlimited · ₱2,999/mo', color: 'bg-[#085041] text-[#9FE1CB]' },
          ].map(p => (
            <div key={p.name} className={`${p.color} px-4 py-2 rounded-full text-sm font-medium`}>
              {p.name} — {p.desc}
            </div>
          ))}
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-16 max-w-2xl w-full text-left">
          {[
            { icon: '👥', title: 'Member tracker', desc: 'Lahat ng miyembro at kanilang records' },
            { icon: '💰', title: 'Fund overview', desc: 'Total fund, collected, at pending' },
            { icon: '📋', title: 'Bills tracker', desc: 'Lahat ng scheduled payments' },
            { icon: '🏦', title: 'Loan management', desc: 'Request, approve, at i-track ang loans' },
            { icon: '📱', title: 'SMS reminders', desc: 'Auto-remind sa overdue members' },
            { icon: '📊', title: 'PDF reports', desc: 'Monthly report para sa treasurer' },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-medium text-sm text-[#1A1A18] mb-1">{f.title}</div>
              <div className="text-xs text-gray-500">{f.desc}</div>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-100 bg-white">
        © 2025 Bayanihan · Community Savings Platform para sa mga Pilipino
      </footer>
    </div>
  )
}
