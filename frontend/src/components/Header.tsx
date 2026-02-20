import { Link, useLocation } from 'react-router-dom'
import { BarChart3, Briefcase, TrendingUp } from 'lucide-react'

function Header() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: '대시보드', icon: BarChart3 },
    { path: '/portfolio', label: '포트폴리오', icon: Briefcase },
  ]

  return (
    <header className="bg-surface-default border-b border-border-default sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-600/30 group-hover:bg-emerald-600/30 transition-colors">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-emerald-400 tracking-tight">
                AI 종목 브리핑 US
              </span>
              <span className="text-[10px] font-medium text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                v31
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map(item => {
              const isActive = location.pathname === item.path
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
