import './page.css';
import { useState } from 'react';

export interface PageProps {
  /** Indique si l'utilisateur est connecté */
  isLoggedIn?: boolean;
  /** Gestionnaire de connexion */
  onLogin?: () => void;
  /** Gestionnaire de déconnexion */
  onLogout?: () => void;
}

/** Page d'exemple pour Storybook avec fonctionnalités de connexion */
export const Page = ({ isLoggedIn = false, onLogin, onLogout }: PageProps) => {
  const [isLoggedInState, setIsLoggedInState] = useState(isLoggedIn);

  const handleLogin = () => {
    setIsLoggedInState(true);
    onLogin?.();
  };

  const handleLogout = () => {
    setIsLoggedInState(false);
    onLogout?.();
  };

  return (
    <div className='storybook-page'>
      <h2>
        <span className='tip'>Bienvenue</span>
        {isLoggedInState ? 'Utilisateur connecté' : "Page d'accueil"}
      </h2>

      <p>
        Ceci est une page d&apos;exemple pour Storybook qui démontre les
        fonctionnalités de connexion et déconnexion.
      </p>

      <div className='tip-wrapper'>
        <svg
          width='12'
          height='12'
          viewBox='0 0 12 12'
          xmlns='http://www.w3.org/2000/svg'
        >
          <g fill='none' fillRule='evenodd'>
            <circle cx='6' cy='6' r='6' fill='#1ea7fd' />
            <path
              d='M6 2C4.89543 2 4 2.89543 4 4C4 5.10457 4.89543 6 6 6C7.10457 6 8 5.10457 8 4C8 2.89543 7.10457 2 6 2Z'
              fill='white'
            />
            <path
              d='M6 7C4.89543 7 4 7.89543 4 9C4 10.1046 4.89543 11 6 11C7.10457 11 8 10.1046 8 9C8 7.89543 7.10457 7 6 7Z'
              fill='white'
            />
          </g>
        </svg>
        <span>Statut: {isLoggedInState ? 'Connecté' : 'Non connecté'}</span>
      </div>

      {isLoggedInState ? (
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: '#ff4444',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Se déconnecter
        </button>
      ) : (
        <button
          onClick={handleLogin}
          style={{
            backgroundColor: '#1ea7fd',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Se connecter
        </button>
      )}

      {isLoggedInState && (
        <div style={{ marginTop: '20px' }}>
          <h3>Contenu réservé aux utilisateurs connectés</h3>
          <p>
            Félicitations ! Vous êtes maintenant connecté et pouvez accéder à ce
            contenu exclusif.
          </p>
          <ul>
            <li>Fonctionnalité premium 1</li>
            <li>Fonctionnalité premium 2</li>
            <li>Fonctionnalité premium 3</li>
          </ul>
        </div>
      )}
    </div>
  );
};
