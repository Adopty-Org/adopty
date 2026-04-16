import React from 'react'
import { Link } from 'react-router' 
import { PageTransition, FadeIn } from '../../components/Animations'

const valeurs = [
  {
    icon: 'favorite',
    couleur: 'bg-[#ffdbcd]',
    titre: 'Le Respect du Vivant',
    texte: "Chez Adopty, chaque animal est un être sensible à part entière. Nous refusons toute forme de maltraitance et militons pour une cohabitation harmonieuse entre l'humain et l'animal. Respecter la vie animale, c'est respecter la vie tout court.",
  },
  {
    icon: 'nature',
    couleur: 'bg-[#bcf0ae]',
    titre: "L'Éveil par la Nature",
    texte: "Le nom «\u00a0L'Éveil Naturel\u00a0» n'est pas un hasard. Nous croyons que le contact avec la nature et les animaux éveille en l'humain ses meilleures qualités : empathie, patience, bienveillance. Notre refuge est conçu comme un espace de reconnexion profonde.",
  },
  {
    icon: 'handshake',
    couleur: 'bg-[#ffdad3]',
    titre: 'La Responsabilité Partagée',
    texte: "Adopter c'est s'engager. Nous accompagnons chaque adoptant tout au long de l'aventure, en avant comme en après. L'abandon ne doit jamais être une option — nous existons pour que ça ne le soit jamais.",
  },
  {
    icon: 'groups',
    couleur: 'bg-[#eaead1]',
    titre: 'La Force de la Communauté',
    texte: "Seuls, nous sauvons quelques vies. Ensemble, nous transformons tout un écosystème. Bénévoles, vétérinaires, familles d'accueil, prestataires et donateurs forment la grande famille Adopty. Chaque geste compte.",
  },
  {
    icon: 'lightbulb',
    couleur: 'bg-[#bcf0ae]',
    titre: "L'Innovation au Service du Bien",
    texte: "Adopty est la preuve que la technologie peut être mise au service des causes qui comptent. Notre plateforme digitale modernise un secteur longtemps laissé à l'abandon en Algérie et offre transparence, efficacité et traçabilité à toutes les parties prenantes.",
  },
  {
    icon: 'balance',
    couleur: 'bg-[#ffdbcd]',
    titre: 'L\'Équité & L\'Inclusion',
    texte: "Chaque animal mérite une chance, quelle que soit son espèce, son âge ou son état de santé. Chaque humain mérite un compagnon, quelle que soit sa situation. Adopty œuvre pour que l'adoption soit accessible, juste et humaine.",
  },
]

const equipe = [
  {
    nom: 'Dr. Yasmine Belkacem',
    role: 'Directrice & Co-fondatrice',
    bio: "Vétérinaire de formation, Yasmine a consacré 15 ans à la cause animale avant de lancer Adopty. Sa vision : une Algérie où aucun animal ne dort à la rue.",
    photo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=',
  },
  {
    nom: 'Karim Meziani',
    role: 'Directeur Technique',
    bio: "Ancien ingénieur logiciel, Karim croit que la tech doit servir des causes nobles. Il a conçu la plateforme Adopty de zéro avec passion.",
    photo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=',
  },
  {
    nom: 'Ines Ouali',
    role: 'Responsable Adoptions',
    bio: "Passionnée de comportement animal, Inès s'assure que chaque adoption est un match parfait entre l'animal et sa nouvelle famille.",
    photo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=',
  },
]

function ConserningPage() {
  return (
    <PageTransition>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="bg-[#154212] py-20 px-6 border-b-4 border-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-4 right-16 text-[200px] font-['Chewy'] text-white rotate-12 leading-none">🌿</div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-white/10 border-2 border-white/30 px-4 py-2 rounded-full mb-6">
              <span className="material-symbols-outlined text-[#fe9e72] text-lg">eco</span>
              <span className="text-white/80 text-sm font-bold uppercase tracking-widest">L'Éveil Naturel</span>
            </div>
            <h1 className="font-['Chewy'] text-6xl md:text-8xl text-white mb-6 leading-tight">
              Qui sommes-<span className="text-[#fe9e72]">nous</span> ?
            </h1>
            <p className="text-white/75 text-xl leading-relaxed max-w-2xl mx-auto">
              Adopty est née d'un constat simple et douloureux : en Algérie, des milliers d'animaux
              abandonnés souffrent, faute d'une structure capable de les accueillir, les soigner et
              les replacer dans des familles aimantes.
            </p>
          </FadeIn>

          <FadeIn delay={0.2} className="flex flex-wrap items-center justify-center gap-8 mt-14">
            {[
              { value: '2.4k+', label: 'Familles heureuses' },
              { value: '15+', label: "Ans d'engagement" },
              { value: '500+', label: 'Animaux en refuge' },
              { value: '97%', label: 'Adoptions réussies' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="font-['Chewy'] text-5xl text-[#fe9e72]">{stat.value}</p>
                <p className="text-white/60 text-xs font-bold uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </FadeIn>
        </div>
      </section>

      {/* ── NOTRE HISTOIRE ────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#fbfbe2]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeIn className="relative">
            <img
              alt="Fondation du refuge Adopty"
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="
              className="w-full rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(148,73,37,1)] object-cover h-80"
            />
            <div className="absolute -bottom-5 -right-5 bg-secondary text-white p-5 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-2">
              <p className="font-['Chewy'] text-2xl">Fondé en 2009</p>
              <p className="text-white/70 text-xs font-bold uppercase">Montpellier, France</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <h2 className="font-['Chewy'] text-5xl text-primary mb-6">Notre Histoire</h2>
            <div className="space-y-4 text-on-surface-variant leading-relaxed">
              <p>
                Tout a commencé en <strong className="text-primary">2009</strong>, lorsque la Dr. Yasmine Belkacem, vétérinaire fraîchement diplômée, a recueilli une portée de chatons abandonnés dans une benne à ordures. Face à l'impossibilité de les replacer faute de structure adaptée, elle a décidé de créer ce qui manquait.
              </p>
              <p>
                Le Refuge de l'Éveil Naturel a ouvert ses portes sur 5 hectares de nature préservée. Depuis, il a accueilli des milliers d'animaux de toutes espèces et transformé autant de vies humaines — parce qu'adopter un animal, c'est aussi se découvrir soi-même.
              </p>
              <p>
                En <strong className="text-primary">2023</strong>, face à la désorganisation du secteur en Algérie, l'équipe a lancé la plateforme <strong className="text-primary">Adopty</strong> : le premier SaaS d'adoption animalière du pays, alliant gestion de refuge, e-commerce solidaire, et services de garde pour prolonger l'accompagnement au-delà de l'adoption.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── NOS VALEURS ───────────────────────────────────────── */}
      <section className="bg-surface-container-low py-24 px-6 border-y-4 border-black">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="font-['Chewy'] text-5xl md:text-6xl text-primary mb-4">Nos Valeurs</h2>
            <p className="text-on-surface-variant text-xl max-w-2xl mx-auto">
              Les principes fondateurs qui guident chacun de nos actes, chaque jour.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {valeurs.map((valeur, i) => (
              <FadeIn key={valeur.titre} delay={i * 0.1} className={`${valeur.couleur} border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 rounded-xl hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all duration-200`}>
                <div className="w-12 h-12 bg-white border-2 border-black rounded-lg flex items-center justify-center mb-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="material-symbols-outlined text-primary text-2xl">{valeur.icon}</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-primary mb-3">{valeur.titre}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{valeur.texte}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── NOTRE ÉQUIPE ──────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#fbfbe2]">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="font-['Chewy'] text-5xl md:text-6xl text-primary mb-4">L'Équipe</h2>
            <p className="text-on-surface-variant text-xl">Des passionnés au service des animaux et des familles.</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {equipe.map((membre, i) => (
              <FadeIn key={membre.nom} delay={i * 0.12} className="bg-surface-container-lowest border-4 border-black shadow-[8px_8px_0px_0px_rgba(21,66,18,1)] rounded-xl overflow-hidden group hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(21,66,18,1)] transition-all duration-200">
                <div className="h-56 overflow-hidden relative">
                  <img
                    src={membre.photo}
                    alt={membre.nom}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-primary">{membre.nom}</h3>
                  <p className="text-secondary font-bold text-sm mb-3">{membre.role}</p>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{membre.bio}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── ENGAGEMENT / CTA ──────────────────────────────────── */}
      <section className="bg-[#154212] py-20 px-6 border-t-4 border-black">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <span className="text-6xl mb-6 block">🐾</span>
            <h2 className="font-['Chewy'] text-5xl md:text-6xl text-white mb-6">
              Rejoignez le mouvement
            </h2>
            <p className="text-white/75 text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
              Adoptez, bénévolisez, achetez solidaire ou simplement partagez. Chaque geste compte dans la construction d'un monde meilleur pour les animaux.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-5">
              <Link
                to="/animaux"
                className="bg-white text-primary px-8 py-4 font-['Plus_Jakarta_Sans'] font-extrabold text-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-3px hover:translate-y-3px hover:shadow-none transition-all flex items-center gap-3"
              >
                <span className="material-symbols-outlined">pets</span>
                Adopter maintenant
              </Link>
              <Link
                to="/boutique"
                className="bg-secondary text-white px-8 py-4 font-['Plus_Jakarta_Sans'] font-extrabold text-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-3px hover:translate-y-3px hover:shadow-none transition-all flex items-center gap-3"
              >
                <span className="material-symbols-outlined">volunteer_activism</span>
                Soutenir le refuge
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

    </PageTransition>
  )
}

export default ConserningPage