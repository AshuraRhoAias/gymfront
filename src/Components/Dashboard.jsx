import React, { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import Header from './Header';

const Dashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
        }
    }, [navigate]);

    return (
        <div className='dashboard-container-DASH DASH'>
            <Header />
            <Outlet />
        </div>
    );
};

export default Dashboard;
