import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ConfirmEmail.css'; // Import the CSS file for styling

const ConfirmEmail = () => {
    const { token } = useParams();
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await axios.post('/api/users/verify-email', { token });
                if (response.data.success) {
                    setMessage('Your account has been verified!');
                } else {
                    setMessage('Verification failed. Please try again.');
                }
            } catch (error) {
                setMessage('An error occurred. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="confirm-email-container">
            <h1>Email Confirmation</h1>
            {loading ? <p>Verifying...</p> : <p>{message}</p>}
        </div>
    );
};

export default ConfirmEmail;