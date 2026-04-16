import React from 'react'
import { NAVIGATION } from './Navbar'
import { Link } from 'react-router'

export default function Footer() {
  return (
    <footer className="bg-[#154212] text-[#fbfbe2] border-t-4 border-black mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-start px-8 py-16 w-full max-w-7xl mx-auto gap-12">
          <div className="max-w-xs">
            <span className="font-['Chewy'] text-4xl text-[#fbfbe2] mb-4 block">Adopty</span>
            <p className="font-['Sora'] text-sm text-[#fbfbe2]/80 leading-relaxed">
              L'Éveil Naturel de l'adoption animale. Nous transformons des vies, une patte à la fois.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="#" className="w-10 h-10 border-2 border-[#fbfbe2]/40 flex items-center justify-center hover:bg-secondary hover:border-secondary transition-colors rounded-lg">
                <span className="material-symbols-outlined text-sm">share</span>
              </a>
              <a href="#" className="w-10 h-10 border-2 border-[#fbfbe2]/40 flex items-center justify-center hover:bg-secondary hover:border-secondary transition-colors rounded-lg">
                <span className="material-symbols-outlined text-sm">public</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-4">
              <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm uppercase tracking-wider text-secondary-fixed">Navigation</h4>
              <ul className="font-['Sora'] text-sm space-y-2">
                {NAVIGATION.slice(0, 4).map(l => (
                  <li key={l.path}><Link to={l.path} className="text-[#fbfbe2]/80 hover:text-secondary-container transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm uppercase tracking-wider text-secondary-fixed">Informations</h4>
              <ul className="font-['Sora'] text-sm space-y-2">
                {['Mentions Légales', 'Confidentialité', 'FAQ', 'Partenaires'].map(l => (
                  <li key={l}><a href="#" className="text-[#fbfbe2]/80 hover:text-secondary-container transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-surface-container-highest/10 p-6 border-2 border-dashed border-[#fbfbe2]/20 rounded-xl">
            <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm uppercase tracking-wider mb-4">Restez informé</h4>
            <div className="flex gap-2">
              <input type="email" placeholder="Email..." className="bg-transparent border-2 border-[#fbfbe2]/40 px-4 py-2 text-sm focus:outline-none focus:bg-[#fbfbe2]/10 text-[#fbfbe2] placeholder-[#fbfbe2]/40 rounded-lg flex-1" />
              <button className="bg-secondary text-white px-4 py-2 font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-lg">
                OK
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-[#fbfbe2]/10 py-6 px-8 text-center max-w-7xl mx-auto">
          <p className="font-['Sora'] text-xs text-[#fbfbe2]/50">© 2024 Adopty - L'Éveil Naturel. Tous droits réservés.</p>
        </div>
      </footer>
  )
}
