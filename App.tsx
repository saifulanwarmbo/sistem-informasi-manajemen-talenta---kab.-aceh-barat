
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import PublicDashboardPage from './pages/PublicDashboardPage';

const App: React.FC = () => {
    // Cek sessionStorage untuk menjaga status login di seluruh muatan ulang tab.
    const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('simt-auth') === 'true');

    /**
     * Menangani upaya login.
     * @param username Nama pengguna yang dimasukkan.
     * @param password Kata sandi yang dimasukkan.
     * @returns {boolean} True jika kredensial valid, jika tidak false.
     */
    const handleLogin = (username: string, password: string): boolean => {
        // Kredensial di-hardcode untuk tujuan demonstrasi.
        // Dalam aplikasi produksi, ini harus divalidasi terhadap backend.
        if (username === 'admin' && password === 'T4l3nt4_413412') {
            sessionStorage.setItem('simt-auth', 'true');
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    /**
     * Menangani logout pengguna.
     */
    const handleLogout = () => {
        sessionStorage.removeItem('simt-auth');
        setIsAuthenticated(false);
    };

    return (
        <>
            {isAuthenticated ? (
                <Dashboard onLogout={handleLogout} />
            ) : (
                <PublicDashboardPage onLogin={handleLogin} />
            )}
        </>
    );
};

export default App;
