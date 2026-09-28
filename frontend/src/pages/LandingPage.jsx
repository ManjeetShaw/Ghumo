import React, { useState } from 'react';

const HERO_SLIDES = [
  {
    id: 0,
    title: 'INDONESIA',
    tag: 'SOUTHEAST ASIA ARCHIPELAGO',
    description:
      'As the largest archipelagic country in the world, Indonesia is blessed with thousands of pristine volcanic isles, emerald terraced mountains, vibrant indigenous cultures, and crystal sea trenches that make it an unmatched odyssey for the conscious soul.',
    ghost: 'ARCHIPELAGO',
    destTarget: 'Bali (DPS), Indonesia',
    bg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9afJYmVRXRVxi9dvdRGEnNImJaGB-a5VJUwqJtqrr0_7ueAGYSE5R__2CtSDoxb00OvuQuvlDa8q_32XGJH5hxbIoEm16QjtNSj5EYnVUwbDH15b7UT_f-lsB1NetJGe-LyGCWyAruZQkuUnjS2DSj8mT6oYoiXCi49zG65RU_V4tVAXtlPyBXQS0EPBn8a6Nx4rNsqGiyv45Tel54MZrR9RtPRWse4vC9HXfzEWplpVhHPduiR2J',
    rating: '4.96',
    voyagers: '2,410'
  },
  {
    id: 1,
    title: 'THAILAND',
    tag: 'KINGDOM OF TRANQUILITY',
    description:
      'Thailand is a Southeast Asian jewel known for tropical beaches, opulent royal palaces, ancient Buddhist ruins, and ornate temples. Experience the sublime serenity of Chiang Rai’s reflective waters and Bangkok’s ultra-modern culinary canopy.',
    ghost: 'SIAM REALM',
    destTarget: 'Bangkok (BKK), Thailand',
    bg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbU12VHOsD9Tbzf3b3xAqZUUwvDK6C5gZVhKGEwsQABXWVgkf0KV4adveMgkt9FqTcz8lR3_OfRgnihzLMoOcRn4yrWxUj0GtyoYcZeBAL-APnBujyR1DKjyzRHnhV3KbVYM7AGeiX7JCigSwCkqQOv0J5_PVsL57wKL4oSGa0kir_JHdxdF8xWWmCWiDVc2QYxSQRG4udiNuoZy7nEUJ12OSK5FLvsdeY8cPWu9cs9GL9ErsQnjxS',
    rating: '4.92',
    voyagers: '3,850'
  },
  {
    id: 2,
    title: 'KERALA',
    tag: "GOD'S OWN COUNTRY",
    description:
      'Celebrated for its palm-fringed backwaters, labyrinthine canal networks, and the Western Ghats mountain slopes supporting aromatic tea and spice plantations, Kerala offers an enchanting escape in South India.',
    ghost: 'MALABAR',
    destTarget: 'Kochi (COK), Kerala, India',
    bg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYg1nJHlgKl4zsv1MsRmW-TOjpS7Zd7BLupD1xaGyETC1AXEyh9fzBx3tVG5leVFXU01c32nraYO2rGpXlmXg6O2Fa4cjICIb_3ZZ1J61ubYZPsZodOau7j9Fnx3HaNQ9NWHJ-pA9VaDh45FbzyxE_mcejqhTG8Sdnv1uNXNu1OOw4ouheAY-auEGcIFGqmNns4VsLHu_TsQfgzpi_yxJRq7_vwy5lTyXkglnmA-5iSzVJOXR7iIJ_',
    rating: '4.94',
    voyagers: '1,920'
  },
  {
    id: 3,
    title: 'BALI ISLES',
    tag: 'INDONESIAN SANCTUARY',
    description:
      'Nusa Penida and the Balinese coastlines harbor majestic natural ocean bridges, crystalline sapphire bays, and mystical sea temples rising from volcanic tides. A sanctuary crafted for slow, transformative global wandering.',
    ghost: 'NUSA PENIDA',
    destTarget: 'Nusa Dua, Bali',
    bg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCS1HAagqZG_hHf4Kiyx6qHeX6kPXcjm0M2L_ND4UBc66gKDn8n-4ZbQ2dsI4BhwTkQ1qLb9_-SJaUP2fVgiSbWIgG2IvAnA_cXROO-KEAsGzbnOPgZOHAtdRKG8kanhpLbW3rLliRxkAUmRUFeOhxU_XoIRPWstJZMp9A9CRN59mx3jOpFTxfhieOvcVIV_eXpC0632gfauQlVWBbgwxPgm9Lim-1dn0oV5U2k5r8POas-LS8iQ_Af',
    rating: '4.98',
    voyagers: '4,110'
  }
];

const CAROUSEL_CARDS = [
  {
    index: 1,
    title: 'Buddha Temple',
    location: 'Chiang Rai, Thailand',
    price: '₹24,800',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUrUnRbAaO8LJ9VHBILSXJy0kvAETW0voyxnllWG2MYGIjk3Fx6zD67znN-617GQ35eM1hx8qJnHD7M0Hd1lsXt6_GaD8g72RzOyl8KKSVVkdG1DebEgJgd_dOE_XMBd0utERfHCkekVmVtxtZzrp-YVBxWNdf_xG4AlsiTI2FJZotvt6sGpjiDU7hoDNJgf8zVDG_yZBTpGljyhbJcGbWp2wvFPLI9VmEOyfcRi_3oOH3eaJbEUFq'
  },
  {
    index: 3,
    title: 'Broken Beach',
    location: 'Nusa Penida, Bali',
    price: '₹31,450',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtzZ_jhZvqdHtqTDpbiNIuZCS8IgJ8DfdQZ2EJA4vDtGz5J9YrXBTarkrjIRo4PY8qd5mAKYWZLO9d5qZWoM2TH_067YjVqgDEkbWeLLbfGq12fUny99_S6OEvFb4b-vP8C7KvZHTWtOz300FbwvSKYZ50T216JjBZIrH51EmLQeEQmC_VvepMCBCQqe2F14RgpqmI-OxFvCy77hZHLjRsnUVWiDal8XkOP8VV0pIUNtwJ7gXdi1-w'
  },
  {
    index: 2,
    title: 'Kerala Serenity',
    location: 'Alleppey, India',
    price: '₹8,990',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDveLA3yeH0iz_4T0gCDQHkOivv5XMa5Nh77PfZ_SQITVd0hMnnNImItxiQa1NBW-AiZ8NyF2M4hZ30rnbaf_ZM4HgRT2nA0HjJclpejejDkEq37qEW5xloEbr1aCkVmPmRaH7-4htVHheEVhJ87fTZ3XPNYlN8Y5kIUbAAuLroZ-sxji4nMmxwEaM3mRU9jXK0QB6TZoTk2D7VSCUUnUv9QEGsMiuKXb7yxlhNHuPYQBGvnm_6xznC'
  },
  {
    index: 0,
    title: 'Mount Bromo',
    location: 'East Java, Indonesia',
    price: '₹28,900',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVs9-lzo4-3am9kw8hyyiC11JJVQwOYt8rJlDcyEIULqBffbARRWm6vO-iD4Domyx_pP5v4biswYTY3OkYxP5cRHhK_hzfv9ZNZE00lmRQiV0WplZewTzZbtIUBLQE2ApIzwAqc1VzzRx5AOLq-QYhnYDOQz6M0-EoUmgqm0pfkzbCs-PcW0s_gCNs1pP3Hj1xbRYzVOQbQfvzFgaD3qEwyFCerEvD6cIOr1_e4X93Q632-LQ4m1B5'
  }
];

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('flights');
  const [searchTarget, setSearchTarget] = useState('Bali (DPS), Indonesia');
  const [departureHub, setDepartureHub] = useState('New Delhi (DEL)');
  const [savedItems, setSavedItems] = useState({});
  const [trekStep, setTrekStep] = useState(1);
  const [packageStep, setPackageStep] = useState(1);

  const slide = HERO_SLIDES[currentSlide];

  const handleSlideSelect = (idx) => {
    setCurrentSlide(idx);
    setSearchTarget(HERO_SLIDES[idx].destTarget);
  };

  const handleNextSlide = () => {
    const next = (currentSlide + 1) % HERO_SLIDES.length;
    handleSlideSelect(next);
  };

  const handlePrevSlide = () => {
    const prev = (currentSlide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length;
    handleSlideSelect(prev);
  };

  const toggleSave = (key) => {
    setSavedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-[#041710] text-[#d1e8dc] flex flex-col font-sans selection:bg-[#0ea5e9] selection:text-[#003751]">
      {/* ── Fixed Global Navigation Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#041710]/70 backdrop-blur-2xl border-b border-white/5 shadow-[0_1px_8px_rgba(0,0,0,0.25)]">
        <div className="h-20 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <a href="#" className="flex items-center gap-2.5 group">
              <img
                src="https://lh3.googleusercontent.com/aida/AEtjO1UwrMJZkvQJ9xRZ9LcWkk1bREkp7gj0p3L7b7RvETVWrkDRKrYqUIOzrojxTBdzy8l_QwXfnbG7dixnZTHQ4yOyk45I-GznPQWEH8xxM0dyglL4gl03vGUx1GTqiG0vXs8OjG3761JVaJz1fOD8Vg431duuilnrw3CrQF81221uGbWN5dyuDQ9dCv33-2hUR241t7DmNH9c-x_xbzsvWI_lYC8IJ-6ejmppdWojcXGnPwP4hooyL9wHrg"
                alt="Foxico AI Logo"
                className="h-8 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white group-hover:text-[#89ceff] transition-colors leading-tight">
                  Foxico
                </span>
                <span className="text-[10px] text-[#ffb95f] -mt-0.5 tracking-[0.2em] uppercase font-bold">
                  AI Voyage
                </span>
              </div>
            </a>
          </div>

          {/* Navigation Pill Container */}
          <nav className="hidden xl:flex items-center bg-[#0b1f18]/80 p-1.5 rounded-full border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
            {[
              { name: 'Destinations', active: true },
              { name: 'Flights', active: false },
              { name: 'Trains', active: false },
              { name: 'Buses', active: false },
              { name: 'Hotels', active: false },
              { name: 'AI Planner', active: true },
              { name: 'My Trips', active: false }
            ].map((link, idx) => (
              <a
                key={idx}
                href="#"
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  link.active
                    ? 'bg-[#253931] text-[#89ceff] shadow-sm'
                    : 'text-[#bec8d2] hover:text-white hover:bg-[#253931]/60'
                }`}
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Utility Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="hidden md:flex items-center gap-2 bg-[#1a2e26]/70 hover:bg-[#253931] px-3.5 py-1.5 rounded-full text-[#bec8d2] hover:text-white transition-all text-xs border border-white/5"
            >
              <span className="material-symbols-outlined text-[17px]">search</span>
              <span>Search voyages...</span>
              <kbd className="bg-[#253931] px-1.5 py-0.5 rounded text-[10px] text-[#89ceff] font-mono font-bold">
                ⌘K
              </kbd>
            </button>

            <div className="hidden sm:flex items-center bg-[#1a2e26]/70 px-3 py-1.5 rounded-full text-xs text-[#bec8d2] border border-white/5">
              <span className="text-[#ffb95f] font-bold">INR ₹</span>
              <span className="mx-1.5 text-white/20">|</span>
              <span className="hover:text-white cursor-pointer">EN</span>
            </div>

            <button
              type="button"
              className="relative p-2 rounded-full bg-[#1a2e26]/70 text-[#bec8d2] hover:text-white hover:bg-[#253931] transition-all border border-white/5"
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ffb95f] ring-2 ring-[#041710]" />
            </button>

            <a
              href="#"
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-[#0b1f18]/80 hover:bg-[#253931] transition-all border border-white/10"
            >
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzrMVEImN0HrmcGiTCzLpzxB_bDWwS0E-2MpQNIklTg2guq87NVEXczngCT1A7zClykQFxSaGOY7w2Ta5cP4k7QcdbX2MzCLCiZ8ivrlFSZJ0xAPzi0RILt54PQ79dFEHiBsD-GZy9PJFeOPGqYWlupDeVlIyGIYsUCawG6dF1Pa5c8tJ9xcFl2BGxghkK5-g9zT41x_iyMg-FJLl3FTUbOun8WQMwpJ3OKT9NaAQ6xQfYuAgXt5Wr"
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-[#89ceff]/50"
                referrerPolicy="no-referrer"
              />
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-[11px] text-[#bec8d2] leading-none">Hello,</span>
                <span className="text-xs text-white font-bold leading-tight">Anney!</span>
              </div>
            </a>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="w-full pt-20 flex-1">
        {/* HERO SHOWCASE STAGE */}
        <section className="relative w-full -mt-20 overflow-hidden select-none min-h-[920px] lg:min-h-screen flex flex-col justify-between">
          {/* Active Background Slides with Crossfade */}
          <div className="absolute inset-0 z-0">
            {HERO_SLIDES.map((s, idx) => (
              <div
                key={s.id}
                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                  currentSlide === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                }`}
                style={{ backgroundImage: `url('${s.bg}')` }}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-[#041710] via-[#041710]/40 to-[#041710]/70" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#041710]/90 via-[#041710]/40 to-transparent" />
          </div>

          {/* Top Live Promo Pill */}
          <div className="relative z-10 w-full pt-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-2 bg-[#10231c]/70 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10 shadow-lg text-xs">
              <span className="w-2 h-2 rounded-full bg-[#ffb95f] animate-ping" />
              <span className="text-[#ffb95f] uppercase tracking-wider font-bold">
                Foxico AI Voyagers Special
              </span>
              <span className="text-[#bec8d2]">Use code</span>
              <span className="text-[#003751] bg-[#0ea5e9] px-2 py-0.5 rounded font-extrabold tracking-wider">
                WELCOME10
              </span>
              <span className="text-[#a3d0c4] font-semibold">10% Off Voyages</span>
            </div>

            <div className="pointer-events-auto hidden sm:flex items-center gap-1.5 bg-[#1a2e26]/70 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs text-[#bec8d2] border border-white/10">
              <span className="material-symbols-outlined text-[16px] text-[#89ceff]">auto_awesome</span>
              <span>Autopilot Itinerary v2.4</span>
              <span className="text-[#ffb95f] font-bold ml-1">Live</span>
            </div>
          </div>

          {/* Hero Content Grid */}
          <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Vertical Stepper */}
            <div className="hidden lg:flex flex-col items-center justify-between absolute left-4 top-1/2 -translate-y-1/2 h-72 z-20">
              <div className="flex flex-col items-center gap-4">
                {HERO_SLIDES.map((_, i) => (
                  <React.Fragment key={i}>
                    <button
                      type="button"
                      onClick={() => handleSlideSelect(i)}
                      className={`transition-all flex items-center justify-center font-bold text-xs ${
                        currentSlide === i
                          ? 'w-7 h-7 rounded-full bg-white text-[#001e2f] shadow-lg ring-2 ring-[#89ceff]'
                          : 'w-2.5 h-2.5 rounded-full bg-white/40 hover:bg-white'
                      }`}
                    >
                      {currentSlide === i ? i + 1 : ''}
                    </button>
                    {i < HERO_SLIDES.length - 1 && <div className="w-0.5 h-8 bg-white/20" />}
                  </React.Fragment>
                ))}
              </div>
              <div className="text-[11px] text-[#bec8d2] tracking-widest [writing-mode:vertical-rl] rotate-180 opacity-70">
                <span className="text-[#89ceff] font-bold">0{currentSlide + 1}</span> / 04
              </div>
            </div>

            {/* Left Narrative Block */}
            <div className="lg:col-span-5 lg:pl-12 flex flex-col items-start text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#89ceff] animate-pulse" />
                <span className="text-xs uppercase tracking-widest text-[#89ceff] font-bold">
                  {slide.tag}
                </span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-extrabold uppercase text-white tracking-tight drop-shadow-2xl">
                {slide.title}
              </h1>

              <p className="text-sm lg:text-base text-[#bec8d2] max-w-lg mt-3 mb-6 leading-relaxed backdrop-blur-[2px]">
                {slide.description}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => setSearchTarget(slide.destTarget)}
                  className="group flex items-center gap-2 bg-[#0ea5e9] hover:bg-[#89ceff] text-[#003751] font-bold text-sm px-8 py-3.5 rounded-full shadow-[0_12px_32px_rgba(14,165,233,0.4)] transition-all hover:scale-105"
                >
                  <span>Explore</span>
                  <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </button>

                <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#10231c]/70 backdrop-blur-xl border border-white/10 text-xs">
                  <span className="material-symbols-outlined text-[17px] text-[#ffb95f]">star</span>
                  <span className="text-white font-bold">{slide.rating}</span>
                  <span className="text-white/30">•</span>
                  <span className="text-[#bec8d2]">{slide.voyagers} Voyagers this month</span>
                </div>
              </div>

              <div className="mt-8 hidden lg:block opacity-20 select-none pointer-events-none">
                <span className="text-5xl font-black text-white/50 uppercase tracking-widest leading-none">
                  {slide.ghost}
                </span>
              </div>
            </div>

            {/* Right Destination Rail */}
            <div className="lg:col-span-7 flex flex-col items-start lg:items-end justify-center w-full">
              <div className="w-full flex items-center gap-4 overflow-x-auto pb-4 pt-2 no-scrollbar scroll-smooth">
                {CAROUSEL_CARDS.map((card, i) => (
                  <div
                    key={i}
                    onClick={() => handleSlideSelect(card.index)}
                    className="group relative shrink-0 w-64 md:w-72 h-96 rounded-2xl overflow-hidden cursor-pointer shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-[1.03] border border-white/10 hover:border-[#0ea5e9]/50"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url('${card.img}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#041710] via-[#041710]/20 to-transparent" />

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSave(`card_${i}`);
                      }}
                      className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 text-[#001e2f] flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all z-10"
                      aria-label="Save destination"
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: `'FILL' ${savedItems[`card_${i}`] ? 1 : 0}` }}
                      >
                        bookmark
                      </span>
                    </button>

                    <div className="absolute top-4 left-4 flex items-center gap-1 z-10 bg-[#041710]/50 backdrop-blur-md px-2.5 py-1 rounded-full">
                      {[1, 2, 3, 4, 5].map((dot) => (
                        <span
                          key={dot}
                          className={`w-1.5 h-1.5 rounded-full ${
                            dot <= 4 ? 'bg-white' : 'bg-white/40'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="absolute bottom-0 inset-x-0 p-5 flex flex-col gap-1 z-10 bg-gradient-to-t from-[#041710] to-transparent pt-8">
                      <span className="text-[11px] uppercase tracking-wider text-[#ffb95f] font-bold">
                        {card.location}
                      </span>
                      <h3 className="text-lg text-white font-bold tracking-tight group-hover:text-[#89ceff] transition-colors">
                        {card.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-[#bec8d2] mt-1">
                        <span>From {card.price}</span>
                        <span className="text-[#a3d0c4] font-semibold flex items-center gap-0.5">
                          Explore{' '}
                          <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Carousel Controls */}
              <div className="flex items-center justify-between w-full mt-4 px-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    aria-label="Previous destination"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white hover:text-[#001e2f] text-white backdrop-blur-lg flex items-center justify-center transition-all border border-white/10"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSlide}
                    aria-label="Next destination"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white hover:text-[#001e2f] text-white backdrop-blur-lg flex items-center justify-center transition-all border border-white/10"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#bec8d2]">
                  <span className="text-white font-bold font-mono">0{currentSlide + 1}</span>
                  <div className="w-12 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#89ceff] transition-all duration-300"
                      style={{ width: `${((currentSlide + 1) / HERO_SLIDES.length) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono">09</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Multimodal Search Dock */}
          <div className="relative z-20 w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-8">
            <div className="bg-[#10231c]/80 backdrop-blur-2xl p-4 md:p-5 rounded-2xl border border-emerald-500/20 shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
              {/* Tab Selector */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
                <div className="flex items-center gap-1.5 p-1 bg-[#0b1f18] rounded-full">
                  {[
                    { id: 'flights', label: 'Flights', icon: 'flight' },
                    { id: 'trains', label: 'Trains', icon: 'train' },
                    { id: 'buses', label: 'Buses', icon: 'directions_bus' },
                    { id: 'hotels', label: 'Hotels', icon: 'hotel' },
                    { id: 'concierge', label: 'AI Concierge', icon: 'psychology', ai: true }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        activeTab === tab.id
                          ? 'bg-[#0ea5e9] text-[#003751] shadow-md'
                          : tab.ai
                          ? 'text-[#ffb95f] hover:bg-[#253931]'
                          : 'text-[#bec8d2] hover:text-white hover:bg-[#253931]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs">
                  <span className="text-[#bec8d2]">Preferred Class:</span>
                  <span className="px-2.5 py-1 rounded bg-[#253931] text-[#89ceff] font-bold border border-white/5">
                    First Class Luxury
                  </span>
                </div>
              </div>

              {/* Segment Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-3">
                <div className="md:col-span-4 bg-[#1a2e26]/70 rounded-xl px-4 py-2.5 flex items-center gap-3 border border-white/5">
                  <span className="material-symbols-outlined text-[#89ceff] text-[20px]">
                    flight_takeoff
                  </span>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] text-[#bec8d2] uppercase tracking-wider font-semibold">
                      Departure Hub
                    </span>
                    <input
                      type="text"
                      value={departureHub}
                      onChange={(e) => setDepartureHub(e.target.value)}
                      className="bg-transparent text-white font-bold text-sm focus:outline-none truncate w-full"
                    />
                  </div>
                  <span className="material-symbols-outlined text-[#88929b] text-[18px]">
                    swap_horiz
                  </span>
                </div>

                <div className="md:col-span-4 bg-[#1a2e26]/70 rounded-xl px-4 py-2.5 flex items-center gap-3 border border-white/5">
                  <span className="material-symbols-outlined text-[#a3d0c4] text-[20px]">
                    location_on
                  </span>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] text-[#bec8d2] uppercase tracking-wider font-semibold">
                      Destination
                    </span>
                    <input
                      type="text"
                      value={searchTarget}
                      onChange={(e) => setSearchTarget(e.target.value)}
                      className="bg-transparent text-white font-bold text-sm focus:outline-none truncate w-full"
                    />
                  </div>
                  <span className="material-symbols-outlined text-[#88929b] text-[18px]">mic</span>
                </div>

                <div className="md:col-span-2 bg-[#1a2e26]/70 rounded-xl px-4 py-2.5 flex items-center gap-3 border border-white/5">
                  <span className="material-symbols-outlined text-[#ffb95f] text-[20px]">
                    calendar_month
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-[#bec8d2] uppercase tracking-wider font-semibold">
                      Travel Window
                    </span>
                    <span className="text-white text-xs font-bold truncate">18 Nov - 26 Nov</span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <button
                    type="button"
                    className="w-full h-full min-h-[48px] bg-[#89ceff] hover:bg-[#0ea5e9] text-[#00344d] font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(2,132,199,0.4)] transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">search</span>
                    <span>Find Routes</span>
                  </button>
                </div>
              </div>

              {/* Bottom Search AI hint */}
              <div className="flex items-center justify-between pt-3 px-1 text-xs text-[#bec8d2]">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="material-symbols-outlined text-[15px] text-[#ffb95f]">
                    tips_and_updates
                  </span>
                  <span className="text-[#88929b]">Try AI prompt:</span>
                  <button
                    type="button"
                    onClick={() => setSearchTarget('Bali (DPS), Indonesia')}
                    className="text-[#89ceff] hover:underline truncate"
                  >
                    "Direct flights Delhi to Bali under ₹35,000 with villa stay"
                  </button>
                </div>
                <span className="hidden md:inline font-mono text-[11px] text-[#a3d0c4] font-semibold">
                  REAL-TIME GDS CONNECTED
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 1: Expedition Corridors - Most Popular Trekking Destinations ── */}
        <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#041710] via-[#0b1f18] to-[#041710] border-t border-emerald-500/10 overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a3d0c4] animate-pulse" />
                  <span className="text-[#a3d0c4] text-xs tracking-[0.25em] font-bold uppercase font-mono">
                    ✦ EXPEDITION CORRIDORS
                  </span>
                </div>
                <h2 className="text-3xl md:text-5xl text-white font-extrabold tracking-tight">
                  Most Popular
                  <br className="hidden sm:inline" />{' '}
                  <span className="bg-gradient-to-r from-white via-[#d1e8dc] to-[#a3d0c4] bg-clip-text text-transparent">
                    Trekking Destinations
                  </span>
                </h2>
              </div>

              <div className="flex items-center gap-4 self-start md:self-end">
                <div className="flex items-center gap-3 text-xs font-mono bg-[#10231c]/70 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10">
                  <span className="text-[#89ceff] font-bold">0{trekStep}</span>
                  <div className="w-12 h-1 bg-[#253931] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#89ceff] to-[#a3d0c4] rounded-full transition-all"
                      style={{ width: `${(trekStep / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-[#bec8d2]">05</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTrekStep((s) => (s > 1 ? s - 1 : 5))}
                    aria-label="Previous trek"
                    className="w-10 h-10 rounded-full border border-white/10 bg-[#10231c]/60 text-white flex items-center justify-center hover:bg-emerald-500/20 hover:text-[#89ceff] transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrekStep((s) => (s < 5 ? s + 1 : 1))}
                    aria-label="Next trek"
                    className="w-10 h-10 rounded-full border border-white/10 bg-[#10231c]/60 text-white flex items-center justify-center hover:bg-emerald-500/20 hover:text-[#89ceff] transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Trekking Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              {/* Peek Card */}
              <div
                className="hidden xl:block md:col-span-2 relative h-[460px] rounded-3xl overflow-hidden opacity-70 hover:opacity-100 transition-all duration-500 bg-cover bg-center cursor-pointer border border-white/10 hover:border-emerald-400/40 group hover:-translate-y-1"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD9afJYmVRXRVxi9dvdRGEnNImJaGB-a5VJUwqJtqrr0_7ueAGYSE5R__2CtSDoxb00OvuQuvlDa8q_32XGJH5hxbIoEm16QjtNSj5EYnVUwbDH15b7UT_f-lsB1NetJGe-LyGCWyAruZQkuUnjS2DSj8mT6oYoiXCi49zG65RU_V4tVAXtlPyBXQS0EPBn8a6Nx4rNsqGiyv45Tel54MZrR9RtPRWse4vC9HXfzEWplpVhHPduiR2J')"
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#041710] via-[#041710]/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-1 z-10">
                  <span className="text-[#a3d0c4] text-xs font-semibold uppercase tracking-wider">
                    Patagonia Peak
                  </span>
                  <div className="text-white font-bold text-xl mt-1">$ 2,900</div>
                  <div className="text-[#bec8d2] text-[11px] flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[14px] text-[#ffb95f]">
                      schedule
                    </span>{' '}
                    10 days
                  </div>
                </div>
              </div>

              {/* Everest Base Camp Featured Card */}
              <div
                className="md:col-span-7 xl:col-span-6 relative h-[460px] rounded-3xl overflow-hidden group shadow-[0_24px_60px_rgba(0,0,0,0.7)] bg-cover bg-center border border-emerald-500/25 hover:border-emerald-400/60 transition-all duration-500"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBVs9-lzo4-3am9kw8hyyiC11JJVQwOYt8rJlDcyEIULqBffbARRWm6vO-iD4Domyx_pP5v4biswYTY3OkYxP5cRHhK_hzfv9ZNZE00lmRQiV0WplZewTzZbtIUBLQE2ApIzwAqc1VzzRx5AOLq-QYhnYDOQz6M0-EoUmgqm0pfkzbCs-PcW0s_gCNs1pP3Hj1xbRYzVOQbQfvzFgaD3qEwyFCerEvD6cIOr1_e4X93Q632-LQ4m1B5')"
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#041710] via-[#041710]/50 to-transparent" />
                <div className="absolute top-5 inset-x-5 flex items-center justify-between z-10">
                  <div className="flex items-center gap-1.5 bg-[#041710]/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-semibold text-[#a3d0c4]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#a3d0c4] animate-ping" />
                    <span>FEATURED EXPEDITION</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSave('everest')}
                    className="w-10 h-10 rounded-full bg-white/90 text-[#001e2f] flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all"
                    aria-label="Save Everest trek"
                  >
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: `'FILL' ${savedItems['everest'] ? 1 : 0}` }}
                    >
                      bookmark
                    </span>
                  </button>
                </div>

                <div className="absolute bottom-0 inset-x-0 p-8 flex flex-col gap-2.5 z-10 bg-gradient-to-t from-[#041710] via-[#041710]/90 to-transparent pt-12">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h3 className="text-white font-extrabold text-2xl lg:text-3xl tracking-tight group-hover:text-[#89ceff] transition-colors">
                      Everest Base Camp, Nepal
                    </h3>
                    <div className="px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-md">
                      <span className="text-[#89ceff] font-bold text-xl lg:text-2xl">$ 3,500</span>
                    </div>
                  </div>
                  <p className="text-[#bec8d2] text-sm max-w-md">
                    Best trek for: aspiring high-altitude mountaineers traversing khumbu icefalls and
                    sherpa monastery ridges.
                  </p>
                  <div className="flex items-center gap-4 text-xs mt-1 pt-1 border-t border-white/10">
                    <div className="flex items-center gap-1.5 text-[#ffb95f] font-semibold">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      <span>2 weeks duration</span>
                    </div>
                    <span className="text-white/20">•</span>
                    <div className="flex items-center gap-1 text-[#bec8d2] font-medium">
                      <span className="material-symbols-outlined text-[16px] text-[#a3d0c4]">
                        elevation
                      </span>
                      <span>5,364m Altitude</span>
                    </div>
                    <span className="text-white/20">•</span>
                    <div className="flex items-center gap-1 text-[#89ceff] font-semibold ml-auto group-hover:translate-x-1 transition-transform">
                      <span>View Route</span>
                      <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Markha Valley Trek */}
              <div
                className="md:col-span-5 xl:col-span-4 relative h-[460px] rounded-3xl overflow-hidden group shadow-2xl bg-cover bg-center border border-white/10 hover:border-emerald-400/50 transition-all duration-500"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBbU12VHOsD9Tbzf3b3xAqZUUwvDK6C5gZVhKGEwsQABXWVgkf0KV4adveMgkt9FqTcz8lR3_OfRgnihzLMoOcRn4yrWxUj0GtyoYcZeBAL-APnBujyR1DKjyzRHnhV3KbVYM7AGeiX7JCigSwCkqQOv0J5_PVsL57wKL4oSGa0kir_JHdxdF8xWWmCWiDVc2QYxSQRG4udiNuoZy7nEUJ12OSK5FLvsdeY8cPWu9cs9GL9ErsQnjxS')"
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#041710] via-[#041710]/50 to-transparent" />
                <div className="absolute top-5 right-5 z-10">
                  <button
                    type="button"
                    onClick={() => toggleSave('markha')}
                    className="w-10 h-10 rounded-full bg-white/90 text-[#001e2f] flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all"
                    aria-label="Save Markha Valley trek"
                  >
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: `'FILL' ${savedItems['markha'] ? 1 : 0}` }}
                    >
                      bookmark
                    </span>
                  </button>
                </div>

                <div className="absolute bottom-0 inset-x-0 p-8 flex flex-col gap-2 z-10 bg-gradient-to-t from-[#041710] via-[#041710]/90 to-transparent pt-12">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-white font-bold text-xl lg:text-2xl tracking-tight group-hover:text-[#89ceff] transition-colors">
                      Markha Valley Trek, Ladakh
                    </h3>
                    <div className="px-3 py-1 rounded-full bg-[#1a2e26]/80 border border-white/10 backdrop-blur-md">
                      <span className="text-[#a3d0c4] font-bold text-lg lg:text-xl">$ 1,850</span>
                    </div>
                  </div>
                  <p className="text-[#bec8d2] text-xs">
                    Best trek for: Tibetan plateau vistas, rustic canyon villages, and high mountain
                    passes.
                  </p>
                  <div className="flex items-center gap-3 text-xs mt-1 pt-1 border-t border-white/10">
                    <div className="flex items-center gap-1.5 text-[#ffb95f] font-semibold">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      <span>1 week duration</span>
                    </div>
                    <span className="text-white/20">•</span>
                    <div className="flex items-center gap-1 text-[#89ceff] font-semibold ml-auto group-hover:translate-x-1 transition-transform">
                      <span>Explore</span>
                      <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 2: Global Transit Matrix - Discover the world through our eyes ── */}
        <section className="relative w-full pt-28 pb-40 px-4 sm:px-6 lg:px-8 bg-[#041710] overflow-hidden text-center border-t border-emerald-500/10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[850px] h-[380px] bg-gradient-to-r from-emerald-500/10 via-sky-500/15 to-emerald-500/10 rounded-full blur-[160px] pointer-events-none" />

          <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#89ceff] animate-pulse" />
              <span className="text-[#89ceff] text-xs tracking-[0.25em] font-bold uppercase font-mono">
                ✦ GLOBAL TRANSIT MATRIX
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl text-white font-extrabold tracking-tight max-w-3xl mb-14">
              Discover the world through
              <br className="hidden sm:inline" />{' '}
              <span className="bg-gradient-to-r from-white via-[#d1e8dc] to-[#89ceff] bg-clip-text text-transparent">
                our eyes
              </span>
            </h2>

            {/* Flight Arc SVG */}
            <div className="relative w-full max-w-5xl my-2 py-4">
              <svg
                className="w-full h-40 md:h-48 overflow-visible"
                preserveAspectRatio="none"
                viewBox="0 0 1000 180"
              >
                <defs>
                  <linearGradient id="flightArcGrad" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" />
                    <stop offset="25%" stopColor="#89ceff" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#a3d0c4" stopOpacity="1" />
                    <stop offset="75%" stopColor="#89ceff" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                <path
                  d="M 30,30 Q 500,170 970,30"
                  fill="transparent"
                  stroke="url(#flightArcGrad)"
                  strokeWidth="3"
                  opacity="0.6"
                />
                <path
                  d="M 30,30 Q 500,170 970,30"
                  fill="transparent"
                  stroke="url(#flightArcGrad)"
                  strokeDasharray="10 10"
                  strokeWidth="2.5"
                />

                {/* Planes */}
                <g transform="translate(100, 54) rotate(18)">
                  <circle cx="0" cy="0" r="14" fill="#0ea5e9" opacity="0.2" />
                  <path
                    d="M12 2a1 1 0 0 1 1 1v6.5l5.5 3.5V15l-5.5-2v4l2 1.5V20l-3-1-3 1v-1.5l2-1.5v-4L4 15v-2l5.5-3.5V3a1 1 0 0 1 1-1z"
                    fill="#c9e6ff"
                    transform="scale(1.2) translate(-10, -10)"
                  />
                </g>
                <g transform="translate(290, 102) rotate(10)">
                  <circle cx="0" cy="0" r="14" fill="#10b981" opacity="0.2" />
                  <path
                    d="M12 2a1 1 0 0 1 1 1v6.5l5.5 3.5V15l-5.5-2v4l2 1.5V20l-3-1-3 1v-1.5l2-1.5v-4L4 15v-2l5.5-3.5V3a1 1 0 0 1 1-1z"
                    fill="#a3d0c4"
                    transform="scale(1.2) translate(-10, -10)"
                  />
                </g>
                <g transform="translate(500, 118) rotate(0)">
                  <circle cx="0" cy="0" r="18" fill="#0ea5e9" opacity="0.25" />
                  <circle cx="0" cy="0" r="6" fill="#89ceff" opacity="0.4" />
                  <path
                    d="M12 2a1 1 0 0 1 1 1v6.5l5.5 3.5V15l-5.5-2v4l2 1.5V20l-3-1-3 1v-1.5l2-1.5v-4L4 15v-2l5.5-3.5V3a1 1 0 0 1 1-1z"
                    fill="#ffffff"
                    transform="scale(1.35) translate(-10, -10)"
                  />
                </g>
                <g transform="translate(710, 102) rotate(-10)">
                  <circle cx="0" cy="0" r="14" fill="#10b981" opacity="0.2" />
                  <path
                    d="M12 2a1 1 0 0 1 1 1v6.5l5.5 3.5V15l-5.5-2v4l2 1.5V20l-3-1-3 1v-1.5l2-1.5v-4L4 15v-2l5.5-3.5V3a1 1 0 0 1 1-1z"
                    fill="#a3d0c4"
                    transform="scale(1.2) translate(-10, -10)"
                  />
                </g>
                <g transform="translate(900, 54) rotate(-18)">
                  <circle cx="0" cy="0" r="14" fill="#0ea5e9" opacity="0.2" />
                  <path
                    d="M12 2a1 1 0 0 1 1 1v6.5l5.5 3.5V15l-5.5-2v4l2 1.5V20l-3-1-3 1v-1.5l2-1.5v-4L4 15v-2l5.5-3.5V3a1 1 0 0 1 1-1z"
                    fill="#c9e6ff"
                    transform="scale(1.2) translate(-10, -10)"
                  />
                </g>
              </svg>

              {/* Continents Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 md:gap-4 items-stretch mt-3">
                {[
                  { name: 'North America', coords: '40.71° N, 74.00° W', hubs: '68+ Hubs' },
                  { name: 'South America', coords: '12.04° S, 77.04° W', hubs: '42+ Hubs' },
                  { name: 'Europe', coords: '48.85° N, 2.35° E', hubs: '110+ Hubs', featured: true },
                  { name: 'Asia', coords: '35.67° N, 139.65° E', hubs: '145+ Hubs' },
                  { name: 'Australia', coords: '33.86° S, 151.20° E', hubs: '36+ Hubs' }
                ].map((cont, i) => (
                  <div
                    key={i}
                    className={`flex flex-col items-center justify-between p-4 rounded-2xl bg-[#10231c]/60 hover:bg-[#1a2e26]/80 backdrop-blur-xl border ${
                      cont.featured ? 'border-emerald-500/40' : 'border-white/10'
                    } hover:border-emerald-400/50 transition-all duration-300 group hover:-translate-y-1 shadow-lg`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#253931]/50 flex items-center justify-center text-[#89ceff] group-hover:text-[#a3d0c4] group-hover:scale-110 transition-all">
                      <span className="material-symbols-outlined text-[26px]">public</span>
                    </div>
                    <span className="text-white text-sm font-bold mt-2.5 group-hover:text-[#89ceff] transition-colors">
                      {cont.name}
                    </span>
                    <span className="text-[11px] font-mono text-[#bec8d2] mt-1">{cont.coords}</span>
                    <div className="mt-2 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#a3d0c4] border border-emerald-500/20">
                      {cont.hubs}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  type="button"
                  className="px-8 py-3.5 rounded-full bg-[#0ea5e9] hover:bg-[#89ceff] text-[#003751] font-bold text-sm shadow-[0_12px_32px_rgba(14,165,233,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <span>Book Global Pass</span>
                  <span className="material-symbols-outlined text-[18px]">flight_takeoff</span>
                </button>
                <button
                  type="button"
                  className="px-7 py-3.5 rounded-full bg-[#1a2e26]/70 hover:bg-[#253931] text-white font-bold text-sm border border-white/10 backdrop-blur-xl transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#ffb95f]">explore</span>
                  <span>Explore Route Matrix</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 3: Curated Packages - Top Packages Handpicked For You ── */}
        <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#041710] via-[#0b1f18] to-[#01110b] border-t border-emerald-500/10 overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a3d0c4] animate-pulse" />
                  <span className="text-[#a3d0c4] text-xs tracking-[0.25em] font-bold uppercase font-mono">
                    ✦ CURATED PACKAGES
                  </span>
                </div>
                <h2 className="text-3xl md:text-5xl text-white font-extrabold tracking-tight">
                  Top Packages
                  <br className="hidden sm:inline" />{' '}
                  <span className="bg-gradient-to-r from-white via-[#d1e8dc] to-[#a3d0c4] bg-clip-text text-transparent">
                    Handpicked For You
                  </span>
                </h2>
              </div>

              <div className="flex items-center gap-4 self-start md:self-end">
                <div className="flex items-center gap-3 text-xs font-mono bg-[#10231c]/70 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10">
                  <span className="text-[#89ceff] font-bold">0{packageStep}</span>
                  <div className="w-12 h-1 bg-[#253931] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#89ceff] to-[#a3d0c4] rounded-full transition-all"
                      style={{ width: `${(packageStep / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-[#bec8d2]">05</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPackageStep((s) => (s > 1 ? s - 1 : 5))}
                    aria-label="Previous package"
                    className="w-10 h-10 rounded-full border border-white/10 bg-[#10231c]/60 text-white flex items-center justify-center hover:bg-emerald-500/20 hover:text-[#89ceff] transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPackageStep((s) => (s < 5 ? s + 1 : 1))}
                    aria-label="Next package"
                    className="w-10 h-10 rounded-full border border-white/10 bg-[#10231c]/60 text-white flex items-center justify-center hover:bg-emerald-500/20 hover:text-[#89ceff] transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Overlapping Package Deck */}
            <div className="relative w-full flex items-center justify-start xl:justify-center overflow-x-auto pb-10 pt-4 no-scrollbar gap-4 md:gap-0">
              {/* Card 1 */}
              <div
                className="relative shrink-0 w-64 md:w-72 h-[440px] rounded-3xl overflow-hidden cursor-pointer shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-300 md:-mr-12 hover:z-20 hover:-translate-y-2 bg-cover bg-center border border-white/10 hover:border-emerald-400/40 group"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDYg1nJHlgKl4zsv1MsRmW-TOjpS7Zd7BLupD1xaGyETC1AXEyh9fzBx3tVG5leVFXU01c32nraYO2rGpXlmXg6O2Fa4cjICIb_3ZZ1J61ubYZPsZodOau7j9Fnx3HaNQ9NWHJ-pA9VaDh45FbzyxE_mcejqhTG8Sdnv1uNXNu1OOw4ouheAY-auEGcIFGqmNns4VsLHu_TsQfgzpi_yxJRq7_vwy5lTyXkglnmA-5iSzVJOXR7iIJ_')"
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#041710] via-[#041710]/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-1.5 z-10">
                  <div className="flex items-center gap-1 text-[#ffb95f] text-xs">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className="material-symbols-outlined text-[15px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    ))}
                    <span className="text-white font-bold ml-1">4.9</span>
                  </div>
                  <h3 className="text-white font-bold text-lg leading-snug group-hover:text-[#89ceff] transition-colors">
                    The Kesugi Ridge Trail
                  </h3>
                  <div className="flex items-center gap-1.5 text-[#bec8d2] text-xs mt-0.5">
                    <span className="material-symbols-outlined text-[14px] text-[#ffb95f]">
                      schedule
                    </span>
                    <span>3 to 4 days</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#a3d0c4] text-xs">
                    <span className="material-symbols-outlined text-[14px]">pin_drop</span>
                    <span>Alaska, USA</span>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div
                className="relative shrink-0 w-64 md:w-72 h-[460px] rounded-3xl overflow-hidden cursor-pointer shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-300 md:-mr-12 hover:z-20 hover:-translate-y-2 bg-cover bg-center border border-white/10 hover:border-emerald-400/40 group"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCS1HAagqZG_hHf4Kiyx6qHeX6kPXcjm0M2L_ND4UBc66gKDn8n-4ZbQ2dsI4BhwTkQ1qLb9_-SJaUP2fVgiSbWIgG2IvAnA_cXROO-KEAsGzbnOPgZOHAtdRKG8kanhpLbW3rLliRxkAUmRUFeOhxU_XoIRPWstJZMp9A9CRN59mx3jOpFTxfhieOvcVIV_eXpC0632gfauQlVWBbgwxPgm9Lim-1dn0oV5U2k5r8POas-LS8iQ_Af')"
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#041710] via-[#041710]/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-1.5 z-10">
                  <div className="flex items-center gap-1 text-[#ffb95f] text-xs">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className="material-symbols-outlined text-[15px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    ))}
                    <span className="text-white font-bold ml-1">4.95</span>
                  </div>
                  <h3 className="text-white font-bold text-lg leading-snug group-hover:text-[#89ceff] transition-colors">
                    The Santa Cruz Track
                  </h3>
                  <div className="flex items-center gap-1.5 text-[#bec8d2] text-xs mt-0.5">
                    <span className="material-symbols-outlined text-[14px] text-[#ffb95f]">
                      schedule
                    </span>
                    <span>3 to 4 days</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#a3d0c4] text-xs">
                    <span className="material-symbols-outlined text-[14px]">pin_drop</span>
                    <span>Cordillera Blanca, Peru</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Elevated Center Focus Card */}
              <div
                className="relative shrink-0 w-72 md:w-80 h-[500px] rounded-3xl overflow-hidden cursor-pointer shadow-[0_30px_70px_rgba(0,0,0,0.8)] z-30 transition-all duration-300 hover:scale-[1.03] bg-cover bg-center border-2 border-emerald-500/40 hover:border-emerald-400 group ring-4 ring-emerald-500/10"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCUrUnRbAaO8LJ9VHBILSXJy0kvAETW0voyxnllWG2MYGIjk3Fx6zD67znN-617GQ35eM1hx8qJnHD7M0Hd1lsXt6_GaD8g72RzOyl8KKSVVkdG1DebEgJgd_dOE_XMBd0utERfHCkekVmVtxtZzrp-YVBxWNdf_xG4AlsiTI2FJZotvt6sGpjiDU7hoDNJgf8zVDG_yZBTpGljyhbJcGbWp2wvFPLI9VmEOyfcRi_3oOH3eaJbEUFq')"
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#041710] via-[#041710]/40 to-transparent" />
                <div className="absolute top-5 inset-x-5 flex items-center justify-between z-10">
                  <div className="bg-[#041710]/70 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/30 text-xs font-semibold text-[#a3d0c4] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#a3d0c4]" />
                    <span>MOST POPULAR CHOICE</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSave('montblanc')}
                    className="w-10 h-10 rounded-full bg-white/90 text-[#001e2f] flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all"
                    aria-label="Save Mont Blanc"
                  >
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: `'FILL' ${savedItems['montblanc'] ? 1 : 0}` }}
                    >
                      bookmark
                    </span>
                  </button>
                </div>

                <div className="absolute bottom-8 left-7 right-7 flex flex-col gap-2 z-10 bg-gradient-to-t from-[#041710] via-[#041710]/80 to-transparent pt-8">
                  <div className="flex items-center gap-1 text-[#ffb95f] text-sm">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className="material-symbols-outlined text-[17px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    ))}
                    <span className="text-white font-bold ml-1.5 text-xs">5.0 (3.2k reviews)</span>
                  </div>
                  <h3 className="text-white font-extrabold text-2xl lg:text-3xl leading-tight group-hover:text-[#89ceff] transition-colors">
                    Tour Du Mont Blanc
                  </h3>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <div className="flex items-center gap-1.5 text-[#bec8d2]">
                      <span className="material-symbols-outlined text-[16px] text-[#ffb95f]">
                        schedule
                      </span>
                      <span>7 to 11 days</span>
                    </div>
                    <span className="text-[#a3d0c4] font-bold text-sm">From €1,850</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#a3d0c4] text-xs">
                    <span className="material-symbols-outlined text-[15px]">pin_drop</span>
                    <span>Europe – France, Italy, Switzerland</span>
                  </div>
                </div>
              </div>

              {/* Card 4 */}
              <div
                className="relative shrink-0 w-64 md:w-72 h-[460px] rounded-3xl overflow-hidden cursor-pointer shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-300 md:-ml-12 hover:z-20 hover:-translate-y-2 bg-cover bg-center border border-white/10 hover:border-emerald-400/40 group"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAtzZ_jhZvqdHtqTDpbiNIuZCS8IgJ8DfdQZ2EJA4vDtGz5J9YrXBTarkrjIRo4PY8qd5mAKYWZLO9d5qZWoM2TH_067YjVqgDEkbWeLLbfGq12fUny99_S6OEvFb4b-vP8C7KvZHTWtOz300FbwvSKYZ50T216JjBZIrH51EmLQeEQmC_VvepMCBCQqe2F14RgpqmI-OxFvCy77hZHLjRsnUVWiDal8XkOP8VV0pIUNtwJ7gXdi1-w')"
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#041710] via-[#041710]/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-1.5 z-10">
                  <div className="flex items-center gap-1 text-[#ffb95f] text-xs">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className="material-symbols-outlined text-[15px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    ))}
                    <span className="text-white font-bold ml-1">4.92</span>
                  </div>
                  <h3 className="text-white font-bold text-lg leading-snug group-hover:text-[#89ceff] transition-colors">
                    Annapurna Circuit & Tilicho
                  </h3>
                  <div className="flex items-center gap-1.5 text-[#bec8d2] text-xs mt-0.5">
                    <span className="material-symbols-outlined text-[14px] text-[#ffb95f]">
                      schedule
                    </span>
                    <span>12 to 14 days</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#a3d0c4] text-xs">
                    <span className="material-symbols-outlined text-[14px]">pin_drop</span>
                    <span>Himalayas, Nepal</span>
                  </div>
                </div>
              </div>

              {/* Card 5 */}
              <div
                className="relative shrink-0 w-64 md:w-72 h-[440px] rounded-3xl overflow-hidden cursor-pointer shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-300 md:-ml-12 hover:z-20 hover:-translate-y-2 bg-cover bg-center border border-white/10 hover:border-emerald-400/40 group"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDveLA3yeH0iz_4T0gCDQHkOivv5XMa5Nh77PfZ_SQITVd0hMnnNImItxiQa1NBW-AiZ8NyF2M4hZ30rnbaf_ZM4HgRT2nA0HjJclpejejDkEq37qEW5xloEbr1aCkVmPmRaH7-4htVHheEVhJ87fTZ3XPNYlN8Y5kIUbAAuLroZ-sxji4nMmxwEaM3mRU9jXK0QB6TZoTk2D7VSCUUnUv9QEGsMiuKXb7yxlhNHuPYQBGvnm_6xznC')"
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#041710] via-[#041710]/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-1.5 z-10">
                  <div className="flex items-center gap-1 text-[#ffb95f] text-xs">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className="material-symbols-outlined text-[15px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    ))}
                    <span className="text-white font-bold ml-1">4.88</span>
                  </div>
                  <h3 className="text-white font-bold text-lg leading-snug group-hover:text-[#89ceff] transition-colors">
                    Milford Track
                  </h3>
                  <div className="flex items-center gap-1.5 text-[#bec8d2] text-xs mt-0.5">
                    <span className="material-symbols-outlined text-[14px] text-[#ffb95f]">
                      schedule
                    </span>
                    <span>4 to 5 days</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#a3d0c4] text-xs">
                    <span className="material-symbols-outlined text-[14px]">pin_drop</span>
                    <span>South Island, New Zealand</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 4: How Foxico Works ── */}
        <section className="relative w-full py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#01110b] via-[#0b1f18] to-[#041710] border-t border-emerald-500/10 overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col relative z-10">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#89ceff] animate-pulse" />
                <span className="text-xs uppercase tracking-widest text-[#89ceff] font-bold font-mono">
                  SEAMLESS JOURNEYS
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl text-white font-extrabold tracking-tight">
                How{' '}
                <span className="bg-gradient-to-r from-white via-[#d1e8dc] to-[#89ceff] bg-clip-text text-transparent">
                  Foxico Works
                </span>
              </h2>
              <p className="text-base md:text-lg text-[#bec8d2] mt-4 leading-relaxed">
                From dream inspiration to autonomous multimodal booking and real-time field
                concierging in 4 fluid steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: '01',
                  icon: 'chat_bubble',
                  color: 'primary',
                  title: '1. Prompt or Select Your Vibe',
                  desc: "Describe your ideal trip in natural language or tap a curated cinematic destination. Foxico's neural planner drafts custom routes."
                },
                {
                  step: '02',
                  icon: 'hub',
                  color: 'secondary',
                  title: '2. Autonomous Multi-Modal Matrix',
                  desc: 'Live cross-comparison across private charter flights, commercial airlines, scenic rail, sleeper buses, and boutique eco-villas in one unified checkout.'
                },
                {
                  step: '03',
                  icon: 'qr_code_2',
                  color: 'tertiary',
                  title: '3. Cryptographic Smart Passes',
                  desc: 'Instant digital boarding passes, offline QR vouchers, chauffeur dispatch telemetry, and emergency medical guarantee saved to Apple/Google Wallet.'
                },
                {
                  step: '04',
                  icon: 'satellite_alt',
                  color: 'primary',
                  title: '4. Live 24/7 Satellite Concierge',
                  desc: 'Autonomous flight delay re-routing, local curated dining bookings, and live expedition tracking across your 5-day corridor.'
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="relative bg-[#10231c]/60 hover:bg-[#1a2e26]/80 backdrop-blur-xl p-8 rounded-3xl border border-emerald-500/15 hover:border-emerald-400/50 transition-all duration-300 flex flex-col group hover:-translate-y-2 shadow-[0_16px_36px_rgba(0,0,0,0.4)]"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#253931] border border-white/10 flex items-center justify-center text-[#89ceff] group-hover:bg-[#89ceff] group-hover:text-[#00344d] transition-all shadow-md">
                      <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                    </div>
                    <span className="font-mono text-2xl font-black text-[#a3d0c4]/30 group-hover:text-[#89ceff] transition-colors">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg text-white font-bold mb-2.5 group-hover:text-[#89ceff] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#bec8d2] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                className="flex items-center gap-2 bg-[#0ea5e9] hover:bg-[#89ceff] text-[#003751] font-bold text-sm px-8 py-4 rounded-full shadow-[0_12px_32px_rgba(14,165,233,0.4)] hover:scale-105 transition-all"
              >
                <span>Launch Your Custom Journey</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-2 bg-[#1a2e26]/70 hover:bg-[#253931] text-white px-7 py-4 rounded-full font-bold text-sm border border-white/10 backdrop-blur-xl transition-all"
              >
                <span className="material-symbols-outlined text-[18px] text-[#ffb95f]">
                  auto_awesome
                </span>
                <span>Try AI Planner Now</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="w-full bg-[#01110b] mt-auto border-t border-white/5 shadow-[0_-4px_24px_rgba(0,0,0,0.3)]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            <div className="lg:col-span-2 flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <img
                  src="https://lh3.googleusercontent.com/aida/AEtjO1UwrMJZkvQJ9xRZ9LcWkk1bREkp7gj0p3L7b7RvETVWrkDRKrYqUIOzrojxTBdzy8l_QwXfnbG7dixnZTHQ4yOyk45I-GznPQWEH8xxM0dyglL4gl03vGUx1GTqiG0vXs8OjG3761JVaJz1fOD8Vg431duuilnrw3CrQF81221uGbWN5dyuDQ9dCv33-2hUR241t7DmNH9c-x_xbzsvWI_lYC8IJ-6ejmppdWojcXGnPwP4hooyL9wHrg"
                  alt="Foxico AI Logo"
                  className="h-7 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
                <span className="text-xl font-bold text-white">Foxico AI</span>
              </div>
              <p className="text-sm text-[#bec8d2] max-w-sm leading-relaxed">
                Intelligent travel orchestration blending bespoke itineraries, high-speed rail,
                seamless intercity transit, and cinematic luxury stays worldwide.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#a3d0c4] animate-pulse" />
                <span className="text-xs text-[#a3d0c4] font-medium">
                  Systems Fully Operational (v2.4 Live)
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="text-xs text-white font-bold uppercase tracking-wider mb-2 font-mono">
                Exploration
              </h4>
              {['Destinations & Stays', 'Autonomous AI Planner', 'Private Aviation Hub', 'Scenic Railway Passes'].map(
                (item, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="text-xs text-[#bec8d2] hover:text-[#89ceff] transition-colors"
                  >
                    {item}
                  </a>
                )
              )}
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="text-xs text-white font-bold uppercase tracking-wider mb-2 font-mono">
                Platform
              </h4>
              {['Voyager Experience', 'Developer APIs', 'Global Transit Graph', 'System Health Diagnostics'].map(
                (item, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="text-xs text-[#bec8d2] hover:text-[#89ceff] transition-colors"
                  >
                    {item}
                  </a>
                )
              )}
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="text-xs text-white font-bold uppercase tracking-wider mb-2 font-mono">
                Concierge
              </h4>
              {['24/7 Global Dispatch', 'Flight Delay Protection', 'Trip Cancellation', 'Privacy & Safety Vault'].map(
                (item, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="text-xs text-[#bec8d2] hover:text-[#89ceff] transition-colors"
                  >
                    {item}
                  </a>
                )
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#bec8d2]">
            <p>© 2025 Foxico AI Travel Technologies Inc. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Security Protocols
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
