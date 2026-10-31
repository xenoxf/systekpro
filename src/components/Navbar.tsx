

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IconMenu2, IconX } from '@tabler/icons-react';
import ThemeToggle from './ThemeToggle';
import styles from '@/styles/Navbar.module.css';
import { datosEmpresa } from '@/data/info';

const navLinks = [
  { href: '/#servicios', label: 'Servicios' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/#proceso', label: 'Proceso' },
  { href: '/#beneficios', label: 'Como trabajamos' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/#contacto', label: 'Contacto' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const menuRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  const openMenu = useCallback(() => {
    setMenuOpen(true);
    document.body.classList.add('menu-open');
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    document.body.classList.remove('menu-open');
  }, []);

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

  // Detectar desplazamiento de página
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Cerrar menú con Escape
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [menuOpen, closeMenu]);

  // Gestionar el foco al abrir y cerrar el menú
  useEffect(() => {
    if (menuOpen) {
      wasOpen.current = true;

      const firstLink =
        menuRef.current?.querySelector<HTMLAnchorElement>('a');

      firstLink?.focus();
    } else if (wasOpen.current) {
      wasOpen.current = false;
      toggleRef.current?.focus();
    }
  }, [menuOpen]);

  // Limpiar el estado del body al desmontar
  useEffect(() => {
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, []);

  return (
    <>
      <header
        id="navbar"
        className={scrolled ? styles.scrolled : ''}
      >
        <div className={styles['nav-container']}>
          <div className={styles['nav-inner']}>

            {/* Logo */}
            <a href="/" aria-label="Sistek Pro - Inicio">
              <img
                src="/logo.png"
                alt="Sistek Pro"
                className={styles['logo-light']}
                style={{
                  maxHeight: '3.2rem',
                  width: 'auto',
                  maxWidth: '160px',
                  objectFit: 'contain',
                }}
              />

              <img
                src="/logo_white.png"
                alt=""
                aria-hidden="true"
                className={styles['logo-dark']}
                style={{
                  maxHeight: '3.2rem',
                  width: 'auto',
                  maxWidth: '160px',
                  objectFit: 'contain',
                }}
              />
            </a>

            {/* Navegación escritorio */}
            <nav
              className={styles['nav-links']}
              aria-label="Navegación principal"
            >
              {navLinks.map((link) => (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Acciones escritorio */}
            <div className={styles['nav-actions']}>
              <ThemeToggle />

              <a
                href={`tel:+57${datosEmpresa.telefono}`}
                className={styles['nav-phone']}
                aria-label={`Llamar a Sistek al +57 ${datosEmpresa.telefono}`}
              >
                <span className={styles['nav-phone-inner']}>
                  <svg
                    className={styles['nav-phone-icon']}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>

                  <span className="sr-only">Teléfono:</span>
                  <span>+57 {datosEmpresa.telefono}</span>
                </span>
              </a>

              <a
                href="/#contacto"
                className={styles['nav-cta']}
              >
                Solicitar servicio
              </a>
            </div>

            {/* Controles móviles */}
            <div className={styles['mobile-menu-btns']}>
              <ThemeToggle />

              <button
                ref={toggleRef}
                type="button"
                className={styles['mobile-menu-btn']}
                onClick={toggleMenu}
                aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
              >
                {menuOpen ? (
                  <IconX
                    className={styles['mobile-menu-btn-icon']}
                    aria-hidden="true"
                  />
                ) : (
                  <IconMenu2
                    className={styles['mobile-menu-btn-icon']}
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Overlay del menú móvil */}
      <div
        className={`${styles['mobile-menu-overlay']} ${menuOpen ? styles.active : ''
          }`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Navegación móvil */}
      <nav
        id="mobile-menu"
        ref={menuRef}
        className={`${styles['mobile-menu']} ${menuOpen ? styles.active : ''
          }`}
        aria-label="Navegación móvil"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <div className={styles['mobile-menu-inner']}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={handleLinkClick}
            >
              {link.label}
            </a>
          ))}

          <a
            href="/#contacto"
            className={styles['mobile-menu-cta']}
            onClick={handleLinkClick}
          >
            Solicitar servicio
          </a>
        </div>
      </nav>
    </>
  );
}

