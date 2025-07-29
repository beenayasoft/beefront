/**
 * Service de logging structuré pour le frontend
 * Permet le suivi des actions utilisateur et des erreurs
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  category: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  stackTrace?: string;
  tags?: string[];
}

export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  enableLocalStorage: boolean;
  maxLocalEntries: number;
  remoteEndpoint?: string;
  batchSize: number;
  flushInterval: number; // en millisecondes
}

class LoggerService {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private sessionId: string;
  private flushTimer?: NodeJS.Timeout;

  private readonly LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4
  };

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      minLevel: 'info',
      enableConsole: import.meta.env.MODE === 'development',
      enableRemote: import.meta.env.MODE === 'production',
      enableLocalStorage: true,
      maxLocalEntries: 1000,
      batchSize: 10,
      flushInterval: 30000, // 30 secondes
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.startFlushTimer();
    this.setupErrorHandlers();
  }

  /**
   * Log un message de debug
   */
  debug(message: string, context?: Record<string, any>, category: string = 'general'): void {
    this.log('debug', message, category, context);
  }

  /**
   * Log un message d'information
   */
  info(message: string, context?: Record<string, any>, category: string = 'general'): void {
    this.log('info', message, category, context);
  }

  /**
   * Log un avertissement
   */
  warn(message: string, context?: Record<string, any>, category: string = 'general'): void {
    this.log('warn', message, category, context);
  }

  /**
   * Log une erreur
   */
  error(message: string, error?: Error, context?: Record<string, any>, category: string = 'error'): void {
    const enhancedContext = {
      ...context,
      errorName: error?.name,
      errorMessage: error?.message,
      stackTrace: error?.stack
    };
    
    this.log('error', message, category, enhancedContext, error?.stack);
  }

  /**
   * Log une erreur fatale
   */
  fatal(message: string, error?: Error, context?: Record<string, any>, category: string = 'fatal'): void {
    const enhancedContext = {
      ...context,
      errorName: error?.name,
      errorMessage: error?.message,
      stackTrace: error?.stack
    };
    
    this.log('fatal', message, category, enhancedContext, error?.stack);
  }

  /**
   * Log une action utilisateur
   */
  logUserAction(action: string, details?: Record<string, any>): void {
    this.info(`User action: ${action}`, details, 'user_action');
  }

  /**
   * Log une navigation
   */
  logNavigation(from: string, to: string, details?: Record<string, any>): void {
    this.info(`Navigation: ${from} -> ${to}`, details, 'navigation');
  }

  /**
   * Log une requête API
   */
  logApiCall(method: string, url: string, status: number, duration: number, details?: Record<string, any>): void {
    const level = status >= 400 ? 'error' : 'info';
    this.log(level, `API ${method} ${url} - ${status}`, 'api', {
      method,
      url,
      status,
      duration,
      ...details
    });
  }

  /**
   * Log une performance
   */
  logPerformance(metric: string, value: number, unit: string = 'ms', details?: Record<string, any>): void {
    this.info(`Performance: ${metric} = ${value}${unit}`, { metric, value, unit, ...details }, 'performance');
  }

  /**
   * Méthode principale de logging
   */
  private log(
    level: LogLevel,
    message: string,
    category: string,
    context?: Record<string, any>,
    stackTrace?: string,
    tags?: string[]
  ): void {
    // Vérifier le niveau minimum
    if (this.LOG_LEVELS[level] < this.LOG_LEVELS[this.config.minLevel]) {
      return;
    }

    const entry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      level,
      message,
      category,
      context,
      userId: this.getCurrentUserId(),
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      stackTrace,
      tags
    };

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Local storage
    if (this.config.enableLocalStorage) {
      this.logToLocalStorage(entry);
    }

    // Remote logging
    if (this.config.enableRemote) {
      this.addToBuffer(entry);
    }
  }

  /**
   * Log vers la console du navigateur
   */
  private logToConsole(entry: LogEntry): void {
    const prefix = `[${entry.timestamp.toISOString()}] [${entry.level.toUpperCase()}] [${entry.category}]`;
    const style = this.getConsoleStyle(entry.level);

    switch (entry.level) {
      case 'debug':
        console.debug(`%c${prefix}`, style, entry.message, entry.context);
        break;
      case 'info':
        console.info(`%c${prefix}`, style, entry.message, entry.context);
        break;
      case 'warn':
        console.warn(`%c${prefix}`, style, entry.message, entry.context);
        break;
      case 'error':
      case 'fatal':
        console.error(`%c${prefix}`, style, entry.message, entry.context, entry.stackTrace);
        break;
    }
  }

  /**
   * Log vers localStorage
   */
  private logToLocalStorage(entry: LogEntry): void {
    try {
      const key = 'app_logs';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const logs = [entry, ...existing].slice(0, this.config.maxLocalEntries);
      localStorage.setItem(key, JSON.stringify(logs));
    } catch (error) {
      console.warn('Impossible de sauvegarder les logs en localStorage:', error);
    }
  }

  /**
   * Ajouter au buffer pour envoi remote
   */
  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    
    if (this.logBuffer.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Envoyer les logs au serveur
   */
  private async flush(): Promise<void> {
    if (this.logBuffer.length === 0 || !this.config.remoteEndpoint) {
      return;
    }

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: logsToSend })
      });
    } catch (error) {
      console.warn('Erreur lors de l\'envoi des logs:', error);
      // Remettre les logs dans le buffer
      this.logBuffer.unshift(...logsToSend);
    }
  }

  /**
   * Démarrer le timer de flush automatique
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Configurer les gestionnaires d'erreurs globaux
   */
  private setupErrorHandlers(): void {
    // Erreurs JavaScript non catchées
    window.addEventListener('error', (event) => {
      this.error(
        `Uncaught error: ${event.message}`,
        new Error(event.message),
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        },
        'uncaught_error'
      );
    });

    // Promesses rejetées non catchées
    window.addEventListener('unhandledrejection', (event) => {
      this.error(
        `Unhandled promise rejection: ${event.reason}`,
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {},
        'unhandled_rejection'
      );
    });
  }

  /**
   * Obtenir les logs depuis localStorage
   */
  getLocalLogs(filter?: {
    level?: LogLevel;
    category?: string;
    since?: Date;
    limit?: number;
  }): LogEntry[] {
    try {
      const logs: LogEntry[] = JSON.parse(localStorage.getItem('app_logs') || '[]');
      
      let filtered = logs.map(log => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));

      if (filter) {
        if (filter.level) {
          const minLevel = this.LOG_LEVELS[filter.level];
          filtered = filtered.filter(log => this.LOG_LEVELS[log.level] >= minLevel);
        }
        
        if (filter.category) {
          filtered = filtered.filter(log => log.category === filter.category);
        }
        
        if (filter.since) {
          filtered = filtered.filter(log => log.timestamp >= filter.since!);
        }
        
        if (filter.limit) {
          filtered = filtered.slice(0, filter.limit);
        }
      }

      return filtered;
    } catch (error) {
      console.warn('Erreur lors de la lecture des logs:', error);
      return [];
    }
  }

  /**
   * Vider les logs locaux
   */
  clearLocalLogs(): void {
    localStorage.removeItem('app_logs');
  }

  /**
   * Exporter les logs
   */
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    const logs = this.getLocalLogs();
    
    if (format === 'csv') {
      const headers = ['timestamp', 'level', 'category', 'message', 'userId', 'url'];
      const csvContent = [
        headers.join(','),
        ...logs.map(log => [
          log.timestamp.toISOString(),
          log.level,
          log.category,
          `"${log.message.replace(/"/g, '""')}"`,
          log.userId || '',
          log.url || ''
        ].join(','))
      ].join('\n');
      
      return csvContent;
    }
    
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Obtenir les métriques de logging
   */
  getMetrics(): {
    totalLogs: number;
    logsByLevel: Record<LogLevel, number>;
    logsByCategory: Record<string, number>;
    errorRate: number;
    recentErrors: LogEntry[];
  } {
    const logs = this.getLocalLogs();
    const logsByLevel: Record<LogLevel, number> = {
      debug: 0, info: 0, warn: 0, error: 0, fatal: 0
    };
    const logsByCategory: Record<string, number> = {};

    logs.forEach(log => {
      logsByLevel[log.level]++;
      logsByCategory[log.category] = (logsByCategory[log.category] || 0) + 1;
    });

    const errorCount = logsByLevel.error + logsByLevel.fatal;
    const errorRate = logs.length > 0 ? (errorCount / logs.length) * 100 : 0;
    
    const recentErrors = logs
      .filter(log => log.level === 'error' || log.level === 'fatal')
      .slice(0, 10);

    return {
      totalLogs: logs.length,
      logsByLevel,
      logsByCategory,
      errorRate,
      recentErrors
    };
  }

  /**
   * Utilitaires privés
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUserId(): string | undefined {
    // Récupérer l'ID utilisateur depuis le contexte d'auth
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.user_id || payload.sub;
      }
    } catch (error) {
      // Ignorer les erreurs de parsing
    }
    return undefined;
  }

  private getConsoleStyle(level: LogLevel): string {
    const styles = {
      debug: 'color: #666; font-weight: normal;',
      info: 'color: #2563eb; font-weight: bold;',
      warn: 'color: #d97706; font-weight: bold;',
      error: 'color: #dc2626; font-weight: bold;',
      fatal: 'color: #fff; background-color: #dc2626; font-weight: bold; padding: 2px 4px;'
    };
    return styles[level];
  }

  /**
   * Nettoyage
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush(); // Dernier flush avant destruction
  }
}

// Instance globale
export const Logger = new LoggerService({
  remoteEndpoint: import.meta.env.MODE === 'production' ? '/api/logs' : undefined
});

export default Logger;