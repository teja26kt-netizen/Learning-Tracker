'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../brand/Logo';

export function Header() {
	const [open, setOpen] = React.useState(false);
	const scrolled = useScroll(40);
    const navigate = useNavigate();
    const location = useLocation();
	const compact = scrolled || open;

    const scrollToAbout = () => {
        if (location.pathname !== '/') {
            navigate('/#about');
            setOpen(false);
            return;
        }
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
        setOpen(false);
    };

    const scrollToWorkflow = () => {
        if (location.pathname !== '/') {
            navigate('/#workflow');
            setOpen(false);
            return;
        }
        document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' });
        setOpen(false);
    };

    const goToLogin = () => {
        setOpen(false);
        navigate('/login');
    };

	const links = [
		{ label: 'About us', onClick: scrollToAbout },
		{ label: 'Workflow', onClick: scrollToWorkflow },
		{ label: 'Get started', onClick: goToLogin, accent: true },
		{ label: 'Log in', onClick: goToLogin },
	];

	React.useEffect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	return (
		<header
			className={cn(
				'sticky z-50 mx-auto w-full min-w-0 max-w-full px-3 sm:px-6 transition-all duration-500 ease-out',
				compact ? 'top-6 md:top-8 max-w-3xl' : 'top-10 md:top-12 max-w-5xl',
			)}
		>
			<nav
				className={cn(
					'flex w-full min-w-0 items-center justify-between rounded-full border transition-all duration-500 ease-out',
					'landing-nav-glass',
					compact
						? 'h-11 md:h-12 px-3 md:px-5'
						: 'h-16 md:h-[4.5rem] px-4 md:px-10',
				)}
			>
				<div
                    className="flex items-center group cursor-pointer shrink-0 transition-all duration-500"
                    style={{ gap: compact ? '0.5rem' : '0.75rem' }}
                    onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                    <Logo
                        className={cn(
                            'shrink-0 group-hover:scale-105 transition-all duration-500',
                            compact ? 'w-7 h-7' : 'w-11 h-11',
                        )}
                    />
                    <span
                        className={cn(
                            'landing-display text-slate-100 hidden sm:inline !tracking-tight transition-all duration-500',
                            compact ? 'text-sm' : 'text-base md:text-lg',
                        )}
                    >
                        Learning<span className="text-sky-400">Tracker</span>
                    </span>
                </div>

				<div
                    className={cn(
                        'hidden items-center md:flex transition-all duration-500',
                        compact ? 'gap-3' : 'gap-6',
                    )}
                >
					{links.map((link) => (
						<button
                            key={link.label}
                            type="button"
                            className={cn(
                                'landing-nav-label transition-all duration-500 text-xs',
                                link.accent
                                    ? 'text-sky-300 hover:text-sky-200'
                                    : 'text-slate-400 hover:text-sky-300',
                            )}
                            onClick={link.onClick}
                        >
							{link.label}
						</button>
					))}
				</div>

				<Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setOpen(!open)}
                    className={cn(
                        'md:hidden rounded-full tap-target-icon transition-all duration-300',
                        'border-2 shadow-md active:scale-95',
                        open
                            ? 'border-slate-800 bg-slate-800 text-white hover:bg-slate-900 hover:text-white'
                            : 'border-sky-600 bg-sky-500 text-white hover:bg-sky-600 hover:text-white',
                        compact ? 'h-10 w-10' : 'h-11 w-11',
                    )}
                    aria-label={open ? 'Close menu' : 'Open menu'}
                    aria-expanded={open}
                >
					<MenuToggleIcon
                        open={open}
                        strokeWidth={3}
                        className={compact ? 'size-5' : 'size-6'}
                    />
				</Button>
			</nav>

			<div
				className={cn(
					'landing-nav-glass fixed right-4 left-4 z-50 flex flex-col overflow-hidden rounded-2xl md:hidden transition-all duration-300',
					compact ? 'top-[4.75rem] md:top-[5.25rem]' : 'top-32',
					open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none',
				)}
			>
				<div className="flex flex-col gap-2 p-5">
					<button
                        type="button"
                        className="text-left py-3 landing-display text-lg text-slate-100 border-b border-white/10"
                        onClick={scrollToAbout}
                    >
						About us
					</button>
					<button
                        type="button"
                        className="text-left py-3 landing-display text-lg text-slate-100 border-b border-white/10"
                        onClick={scrollToWorkflow}
                    >
						Workflow
					</button>
					<button
                        type="button"
                        className="text-left py-3 landing-display text-lg text-sky-300"
                        onClick={goToLogin}
                    >
						Get started
					</button>
				</div>
			</div>
		</header>
	);
}
