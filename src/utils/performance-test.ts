/**
 * Utilitaires pour tester les performances de l'API
 */

interface PerformanceTestResult {
  endpoint: string;
  method: string;
  averageTime: number;
  minTime: number;
  maxTime: number;
  totalQueries: number;
  averageQueries: number;
  samples: number;
  timestamp: string;
}

export class PerformanceTester {
  private results: PerformanceTestResult[] = [];

  /**
   * Test un endpoint plusieurs fois et calcule les moyennes
   */
  async testEndpoint(
    url: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    samples: number = 5,
    headers: Record<string, string> = {}
  ): Promise<PerformanceTestResult> {
    
    console.log(`🧪 Test de performance: ${method} ${url} (${samples} échantillons)`);
    
    const times: number[] = [];
    const queries: number[] = [];
    
    // Effectuer plusieurs appels
    for (let i = 0; i < samples; i++) {
      const startTime = performance.now();
      
      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
            ...headers
          }
        });
        
        const endTime = performance.now();
        const requestTime = endTime - startTime;
        
        // Récupérer les métriques depuis les headers
        const sqlQueries = parseInt(response.headers.get('X-Performance-Queries') || '0');
        
        times.push(requestTime);
        queries.push(sqlQueries);
        
        console.log(`  Sample ${i + 1}: ${requestTime.toFixed(1)}ms, ${sqlQueries} SQL queries`);
        
        // Petite pause entre les requêtes
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`  Sample ${i + 1}: Erreur`, error);
      }
    }
    
    // Calculer les statistiques
    const result: PerformanceTestResult = {
      endpoint: url,
      method,
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      totalQueries: queries.reduce((a, b) => a + b, 0),
      averageQueries: queries.reduce((a, b) => a + b, 0) / queries.length,
      samples: samples,
      timestamp: new Date().toISOString()
    };
    
    this.results.push(result);
    
    console.log(`📊 Résultats:`, result);
    return result;
  }

  /**
   * Test de comparaison avant/après optimisation
   */
  async compareEndpoints(
    optimizedUrl: string,
    legacyUrl: string,
    samples: number = 3
  ) {
    console.log('🔄 Comparaison des performances...');
    
    const optimized = await this.testEndpoint(optimizedUrl, 'GET', samples);
    const legacy = await this.testEndpoint(legacyUrl, 'GET', samples);
    
    const improvement = {
      timeImprovement: ((legacy.averageTime - optimized.averageTime) / legacy.averageTime * 100).toFixed(1),
      queriesImprovement: ((legacy.averageQueries - optimized.averageQueries) / legacy.averageQueries * 100).toFixed(1)
    };
    
    console.log(`🎯 AMÉLIORATION:`, improvement);
    console.log(`  ⚡ Temps: ${improvement.timeImprovement}% plus rapide`);
    console.log(`  📊 Requêtes SQL: ${improvement.queriesImprovement}% moins de requêtes`);
    
    return { optimized, legacy, improvement };
  }

  /**
   * Test de charge (plusieurs requêtes simultanées)
   */
  async loadTest(url: string, concurrentRequests: number = 5) {
    console.log(`🚀 Test de charge: ${concurrentRequests} requêtes simultanées`);
    
    const startTime = performance.now();
    
    const promises = Array.from({ length: concurrentRequests }, (_, i) => 
      fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      }).then(response => ({
        index: i,
        time: performance.now() - startTime,
        queries: parseInt(response.headers.get('X-Performance-Queries') || '0'),
        status: response.status
      }))
    );
    
    const results = await Promise.all(promises);
    const totalTime = performance.now() - startTime;
    
    console.log(`📊 Résultats du test de charge:`, {
      totalTime: totalTime.toFixed(1) + 'ms',
      averageResponseTime: (results.reduce((acc, r) => acc + r.time, 0) / results.length).toFixed(1) + 'ms',
      totalQueries: results.reduce((acc, r) => acc + r.queries, 0),
      successRate: (results.filter(r => r.status === 200).length / results.length * 100).toFixed(1) + '%'
    });
    
    return results;
  }

  /**
   * Exporter les résultats
   */
  exportResults(): string {
    return JSON.stringify(this.results, null, 2);
  }

  /**
   * Effacer les résultats
   */
  clearResults(): void {
    this.results = [];
  }

  /**
   * Afficher un rapport de performance dans la console
   */
  generateReport(): void {
    console.table(this.results);
  }
}

// Instance globale pour faciliter l'utilisation
export const performanceTester = new PerformanceTester();

// Fonctions utilitaires rapides
export const quickTest = {
  /**
   * Test rapide des tiers optimisés vs non-optimisés
   */
  tiersComparison: () => performanceTester.compareEndpoints(
    'http://localhost:8000/api/tiers/tiers/frontend_format/?page=1&page_size=10',
    'http://localhost:8000/api/tiers/tiers/frontend_format_legacy/?page=1&page_size=10'
  ),

  /**
   * Test de pagination (différentes tailles de page)
   */
  paginationTest: async () => {
    const sizes = [5, 10, 20, 50];
    const results = [];
    
    for (const size of sizes) {
      const result = await performanceTester.testEndpoint(
        `http://localhost:8000/api/tiers/tiers/frontend_format/?page=1&page_size=${size}`,
        'GET',
        3
      );
      results.push({ pageSize: size, ...result });
    }
    
    console.table(results);
    return results;
  },

  /**
   * Test avec et sans recherche
   */
  searchTest: async () => {
    const withoutSearch = await performanceTester.testEndpoint(
      'http://localhost:8000/api/tiers/tiers/frontend_format/?page=1&page_size=10',
      'GET',
      3
    );
    
    const withSearch = await performanceTester.testEndpoint(
      'http://localhost:8000/api/tiers/tiers/frontend_format/?page=1&page_size=10&search=test',
      'GET',
      3
    );
    
    console.log('📊 Comparaison avec/sans recherche:', { withoutSearch, withSearch });
    return { withoutSearch, withSearch };
  }
};

// Ajouter au window pour faciliter l'utilisation dans la console
if (typeof window !== 'undefined') {
  (window as any).performanceTester = performanceTester;
  (window as any).quickTest = quickTest;
} 