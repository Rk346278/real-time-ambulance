import React, { useState } from 'react';
import { DriverDashboard } from './components/DriverDashboard';
import { NurseDashboard } from './components/NurseDashboard';
import { HospitalDashboard } from './components/HospitalDashboard';

// ⭐ FIXED: correct import (your folder structure)
import { RouteMapPage } from "./src/pages/RouteMapPage";

type Page = 'home' | 'driver' | 'nurse' | 'hospital' | 'routeMap';

interface NavigationCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    className: string;
}

const NavigationCard: React.FC<NavigationCardProps> = ({ title, description, icon, onClick, className }) => (
    <button
        onClick={onClick}
        className={`group relative p-8 w-full max-w-sm text-left bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden transform hover:-translate-y-2 transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${className}`}
    >
        <div className="relative z-10">
            <div className="mb-4 p-3 bg-gray-900/50 rounded-full w-max border border-gray-600 group-hover:bg-opacity-100 transition-colors">
                {icon}
            </div>
            <h3 className="text-2xl font-bold text-slate-100">{title}</h3>
            <p className="mt-2 text-slate-400">{description}</p>
        </div>
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 bg-blue-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
);

const DriverIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const NurseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const HospitalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;

const HomePage: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => (
    <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-4">
            <NavigationCard
                title="Driver Dashboard"
                description="Submit route and ETA updates from the ambulance."
                icon={<DriverIcon />}
                onClick={() => onNavigate('driver')}
                className="focus-visible:ring-blue-500"
            />
            <NavigationCard
                title="Nurse Dashboard"
                description="Provide patient vitals and immediate medical needs."
                icon={<NurseIcon />}
                onClick={() => onNavigate('nurse')}
                className="focus-visible:ring-indigo-500"
            />
            <NavigationCard
                title="Hospital Dashboard"
                description="Monitor all incoming ambulance and patient data in real-time."
                icon={<HospitalIcon />}
                onClick={() => onNavigate('hospital')}
                className="focus-visible:ring-green-500"
            />
        </div>
    </div>
);

const App: React.FC = () => {
    const [page, setPage] = useState<Page>('home');

    // ⭐ This stores route selected from driver modal
    const [selectedRoute, setSelectedRoute] = useState<any>(null);

    const renderContent = () => {
        switch (page) {
            case 'driver':
                return (
                    <DriverDashboard
                        onBack={() => setPage('home')}

                        // ⭐ When driver selects a route → store it → go to map page
                        onSelectRoute={(route: any) => {
                            setSelectedRoute(route);
                            setPage('routeMap');
                        }}
                    />
                );

            case 'nurse':
                return <NurseDashboard onBack={() => setPage('home')} />;

            case 'hospital':
                return <HospitalDashboard onBack={() => setPage('home')} />;

            case 'routeMap':
                return (
                    <RouteMapPage
                        route={selectedRoute}
                        onBack={() => setPage('driver')}
                    />
                );

            default:
                return <HomePage onNavigate={setPage} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 font-sans text-slate-200">
            <header className="py-6 border-b border-gray-800">
                <div className="container mx-auto px-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-100 text-center">
                        🚑 Real-Time Ambulance System
                    </h1>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 md:py-12">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;
