import React, { useState, useEffect } from 'react';
import { IconMenu2, IconX } from '@tabler/icons-react';
import ThemeToggle from './ThemeToggle';

const navLinks = [
  { href: '#servicios', label: 'Servicios' },
  { href: '#proceso', label: 'Proceso' },
  { href: '#beneficios', label: 'Beneficios' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contacto', label: 'Contacto' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const openMenu = () => {
    setMenuOpen(true);
    document.body.classList.add('menu-open');
  };

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.classList.remove('menu-open');
  };

  const toggleMenu = () => {
    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const handleLinkClick = () => {
    closeMenu();
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.pageYOffset > 50);
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) {
        closeMenu();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [menuOpen]);

  return (
    <header id="navbar" className={scrolled ? 'glass-strong' : ''}>
      <div className="nav-container">
        <div className="nav-inner">
          <a href="#" className="nav-logo">
            <div className="nav-logo-icon">S</div>
            <span className="nav-logo-text">
              Sistek<span className="gradient-text">Pro</span>
            </span>
          </a>

          <nav className="nav-links">
            {navLinks.map(link => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="nav-actions">
            <ThemeToggle />
            <a href="tel:+571234513541" className="nav-phone">
              <span className="nav-phone-inner">
                <svg className="nav-phone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>123 4513541</span>
              </span>
            </a>
            <a href="#contacto" className="nav-cta">
              Solicitar servicio
            </a>
          </div>

          <div className="mobile-menu-btns">
            <ThemeToggle />
            <button
              className="mobile-menu-btn"
              onClick={toggleMenu}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <IconX className="mobile-menu-btn-icon" /> : <IconMenu2 className="mobile-menu-btn-icon" />}
            </button>
          </div>
        </div>
      </div>


      <div
        className={`mobile-menu-overlay${menuOpen ? ' active' : ''}`}
        onClick={closeMenu}
      />

      <nav
        className={`mobile-menu${menuOpen ? ' active' : ''}`}
        aria-label="Navegación móvil"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="mobile-menu-inner">
          {navLinks.map(link => (
            <a key={link.href} href={link.href} onClick={handleLinkClick}>
              {link.label}
            </a>
          ))}
          <a href="#contacto" className="mobile-menu-cta" onClick={handleLinkClick}>
            Solicitar servicio
          </a>
        </div>
      </nav>
    </header>
  );
}
