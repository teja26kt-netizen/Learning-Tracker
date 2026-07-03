import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/** True only after session check finished and user is signed in. */
export const useAuthReady = () => {
    const { user, loading } = useContext(AuthContext);
    return { user, ready: !loading && Boolean(user) };
};
