/**
 * Composant de débogage pour tester la recherche de clients
 */
import React, { useState, useEffect } from 'react';
import { crmApi } from './features/crm/api/crm';
import { TierRelation } from './features/crm/types/crm.types';
import AuthService from './lib/services/authService';

const DebugClientSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authInfo, setAuthInfo] = useState<any>(null);

  // Vérifier l'état de l'authentification au chargement
  useEffect(() => {
    const checkAuth = () => {
      const authService = AuthService.getInstance();
      const isAuth = authService.isAuthenticated();
      const tokens = authService.getTokens();
      const user = authService.getUser();
      
      setAuthInfo({
        isAuthenticated: isAuth,
        hasAccessToken: !!tokens.accessToken,
        hasRefreshToken: !!tokens.refreshToken,
        user: user,
        accessTokenLength: tokens.accessToken?.length || 0,
        isTokenExpired: authService.isTokenExpired()
      });
    };
    
    checkAuth();
  }, []);

  const testSearch = async () => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      console.log('🔍 Test recherche avec terme:', searchTerm);
      
      // Test 1: Appel direct à l'API
      const response = await crmApi.tiers.getClients(searchTerm);
      console.log('📊 Réponse API:', response);
      setResults(response);

    } catch (err: any) {
      console.error('❌ Erreur:', err);
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const testDirectAPI = async () => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      console.log('🌐 Test API direct avec fetch');
      
      const authService = AuthService.getInstance();
      const { accessToken } = authService.getTokens();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
        console.log('🔑 Token ajouté:', accessToken.substring(0, 20) + '...');
      }
      
      const response = await fetch('http://localhost:8000/api/tiers/', {
        method: 'GET',
        headers,
      });

      console.log('📊 Status response:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 Réponse fetch:', data);
      setResults(data.results || []);

    } catch (err: any) {
      console.error('❌ Erreur fetch:', err);
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🔍 Debug Client Search</h2>
      
      {/* Informations d'authentification */}
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', border: '1px solid #ccc' }}>
        <h3>🔐 État de l'authentification</h3>
        {authInfo ? (
          <pre>{JSON.stringify(authInfo, null, 2)}</pre>
        ) : (
          <p>Chargement...</p>
        )}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Terme de recherche..."
          style={{ padding: '8px', marginRight: '10px', width: '200px' }}
        />
        <button onClick={testSearch} disabled={loading} style={{ padding: '8px', marginRight: '10px' }}>
          Test avec crmApi
        </button>
        <button onClick={testDirectAPI} disabled={loading} style={{ padding: '8px' }}>
          Test avec fetch direct
        </button>
      </div>

      {loading && <p>⏳ Chargement...</p>}
      {error && <p style={{ color: 'red' }}>❌ Erreur: {error}</p>}
      
      <div>
        <h3>Résultats ({results.length})</h3>
        {results.length === 0 && !loading && (
          <p style={{ color: 'gray' }}>Aucun résultat</p>
        )}
        
        {results.map((client, index) => (
          <div key={client.id || index} style={{ 
            border: '1px solid #ccc', 
            padding: '10px', 
            margin: '5px 0',
            backgroundColor: '#f9f9f9' 
          }}>
            <strong>{client.name || client.nom}</strong>
            <br />
            Type: {client.type}
            <br />
            Relation: {client.relation}
            <br />
            ID: {client.id}
            <br />
            <pre>{JSON.stringify(client, null, 2)}</pre>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <h4>Configuration:</h4>
        <p>TierRelation.CLIENT = {TierRelation.CLIENT}</p>
        <p>TierRelation.PROSPECT = {TierRelation.PROSPECT}</p>
        <p>URL API: http://localhost:8000/api/tiers/</p>
      </div>
    </div>
  );
};

export default DebugClientSearch;