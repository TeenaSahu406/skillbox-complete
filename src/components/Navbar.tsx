import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
    const { user, profile } = useAuth();
    const nav = useNavigate();

    const [dark, setDark] = useState(() => {
        return localStorage.getItem('skillbox-theme') === 'dark';
    });

    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        document.documentElement.dataset.theme = dark ? 'dark' : 'light';
        localStorage.setItem('skillbox-theme', dark ? 'dark' : 'light');
    }, [dark]);

    useEffect(() => {
        setMenuOpen(false);
    }, [user, profile?.role]);

    async function signOut() {
        await supabase.auth.signOut();
        setMenuOpen(false);
        nav('/');
    }

    const isCandidate = profile?.role === 'candidate';
    const isRecruiter = profile?.role === 'recruiter';

    const dashboardPath = isRecruiter
        ? '/recruiter'
        : isCandidate
            ? '/candidate'
            : '/';

    return (
        <header className="nav">
            <div className="wrap navin">

                {/* LOGO */}
                <Link
                    to="/"
                    className="logo"
                    onClick={() => setMenuOpen(false)}
                >
                    <b>▦</b>
                    Skill<span>Box</span>
                </Link>

                {/* DESKTOP NAV */}
                <nav className="desktop-nav">

                    {!isRecruiter && (
                        <Link to="/jobs">
                            Find Jobs
                        </Link>
                    )}

                    <Link to="/skills">
                        Skill Windows
                    </Link>

                    <a href="/#how">
                        How it works
                    </a>

                    {isRecruiter && (
                        <>
                            <Link to="/recruiter/company">
                                Company
                            </Link>

                            <Link to="/recruiter/jobs/new">
                                Post Job
                            </Link>

                            <Link to="/recruiter/applications">
                                Applications
                            </Link>
                        </>
                    )}

                </nav>

                {/* RIGHT SIDE */}
                <div className="actions">

                    {/* THEME */}
                    <button
                        type="button"
                        className="theme-toggle"
                        onClick={() => setDark((value) => !value)}
                        aria-label={
                            dark
                                ? 'Switch to light mode'
                                : 'Switch to dark mode'
                        }
                        title={
                            dark
                                ? 'Switch to light mode'
                                : 'Switch to dark mode'
                        }
                    >
                        {dark ? '☀️' : '🌙'}
                    </button>

                    {/* DESKTOP ACCOUNT */}
                    <div className="desktop-account">
                        {user ? (
                            <>
                                <Link to={dashboardPath}>
                                    {profile?.full_name || 'Dashboard'}
                                </Link>

                                <button
                                    type="button"
                                    className="btn ghost"
                                    onClick={signOut}
                                >
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    Sign in
                                </Link>

                                <Link
                                    className="btn"
                                    to="/register"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* MOBILE MENU BUTTON */}
                    <button
                        type="button"
                        className="mobile-menu-btn"
                        onClick={() => setMenuOpen((value) => !value)}
                        aria-label="Open menu"
                        aria-expanded={menuOpen}
                    >
                        {menuOpen ? '✕' : '☰'}
                    </button>

                </div>
            </div>

            {/* MOBILE MENU */}
            {menuOpen && (
                <div className="mobile-menu">

                    <Link
                        to="/jobs"
                        onClick={() => setMenuOpen(false)}
                    >
                        Find Jobs
                    </Link>

                    <Link
                        to="/skills"
                        onClick={() => setMenuOpen(false)}
                    >
                        Skill Windows
                    </Link>

                    <a
                        href="/#how"
                        onClick={() => setMenuOpen(false)}
                    >
                        How it works
                    </a>

                    {isCandidate && (
                        <>
                            <div className="mobile-divider" />

                            <Link
                                to="/candidate"
                                onClick={() => setMenuOpen(false)}
                            >
                                Candidate Dashboard
                            </Link>

                            <Link
                                to="/candidate/profile"
                                onClick={() => setMenuOpen(false)}
                            >
                                My Profile
                            </Link>
                        </>
                    )}

                    {isRecruiter && (
                        <>
                            <div className="mobile-divider" />

                            <Link
                                to="/recruiter"
                                onClick={() => setMenuOpen(false)}
                            >
                                Recruiter Dashboard
                            </Link>

                            <Link
                                to="/recruiter/company"
                                onClick={() => setMenuOpen(false)}
                            >
                                Company Profile
                            </Link>

                            <Link
                                to="/recruiter/jobs/new"
                                onClick={() => setMenuOpen(false)}
                            >
                                Post Job
                            </Link>

                            <Link
                                to="/recruiter/applications"
                                onClick={() => setMenuOpen(false)}
                            >
                                Applications
                            </Link>
                        </>
                    )}

                    <div className="mobile-divider" />

                    {user ? (
                        <button
                            type="button"
                            className="mobile-signout"
                            onClick={signOut}
                        >
                            Sign out
                        </button>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                onClick={() => setMenuOpen(false)}
                            >
                                Sign in
                            </Link>

                            <Link
                                className="btn full"
                                to="/register"
                                onClick={() => setMenuOpen(false)}
                            >
                                Register
                            </Link>
                        </>
                    )}

                </div>
            )}
        </header>
    );
}