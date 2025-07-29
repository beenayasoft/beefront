/**
 * Système d'alertes et notifications pour l'application
 * Gère les notifications en temps réel, les alertes système et les rappels
 */

export type AlertType = 'info' | 'success' | 'warning' | 'error' | 'critical';
export type AlertPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Alert {
  id: string;
  type: AlertType;
  priority: AlertPriority;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  isDismissed: boolean;
  category: string;
  actions?: Array<{
    label: string;
    action: () => void;
    style?: 'primary' | 'secondary' | 'destructive';
  }>;
  metadata?: Record<string, any>;
  expiresAt?: Date;
  persistent?: boolean;
  sound?: boolean;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: (context: any) => boolean;
  alertConfig: Omit<Alert, 'id' | 'timestamp' | 'isRead' | 'isDismissed'>;
  cooldown?: number; // en millisecondes
  enabled: boolean;
  lastTriggered?: Date;
}

export interface NotificationSettings {
  enabled: boolean;
  types: Record<AlertType, boolean>;
  categories: Record<string, boolean>;
  sound: boolean;
  desktop: boolean;
  showOnlyUrgent: boolean;
  maxVisible: number;
}

class AlertSystemService {
  private alerts: Alert[] = [];
  private rules: AlertRule[] = [];
  private settings: NotificationSettings;
  private listeners: Array<(alerts: Alert[]) => void> = [];
  private soundEnabled: boolean = true;

  constructor() {
    this.settings = this.loadSettings();
    this.setupDefaultRules();
    this.requestNotificationPermission();
  }

  /**
   * Ajouter une alerte
   */
  addAlert(alertData: Omit<Alert, 'id' | 'timestamp' | 'isRead' | 'isDismissed'>): string {
    const alert: Alert = {
      ...alertData,
      id: this.generateId(),
      timestamp: new Date(),
      isRead: false,
      isDismissed: false
    };

    // Vérifier si les notifications pour ce type sont activées
    if (!this.settings.enabled || !this.settings.types[alert.type]) {
      return alert.id;
    }

    // Vérifier si les notifications pour cette catégorie sont activées
    if (!this.settings.categories[alert.category]) {
      return alert.id;
    }

    // Filtrer par urgence si configuré
    if (this.settings.showOnlyUrgent && alert.priority !== 'urgent') {
      return alert.id;
    }

    this.alerts.unshift(alert);

    // Limiter le nombre d'alertes visibles
    if (this.alerts.length > this.settings.maxVisible) {
      this.alerts = this.alerts.slice(0, this.settings.maxVisible);
    }

    // Jouer un son si activé
    if (this.settings.sound && alert.sound !== false) {
      this.playNotificationSound(alert.type);
    }

    // Notification desktop
    if (this.settings.desktop && alert.priority === 'urgent') {
      this.showDesktopNotification(alert);
    }

    // Notifier les listeners
    this.notifyListeners();

    // Auto-expiration
    if (alert.expiresAt) {
      setTimeout(() => {
        this.dismissAlert(alert.id);
      }, alert.expiresAt.getTime() - Date.now());
    }

    return alert.id;
  }

  /**
   * Méthodes pratiques pour différents types d'alertes
   */
  info(title: string, message: string, options?: Partial<Alert>): string {
    return this.addAlert({
      type: 'info',
      priority: 'low',
      title,
      message,
      category: 'general',
      ...options
    });
  }

  success(title: string, message: string, options?: Partial<Alert>): string {
    return this.addAlert({
      type: 'success',
      priority: 'medium',
      title,
      message,
      category: 'general',
      ...options
    });
  }

  warning(title: string, message: string, options?: Partial<Alert>): string {
    return this.addAlert({
      type: 'warning',
      priority: 'medium',
      title,
      message,
      category: 'general',
      ...options
    });
  }

  error(title: string, message: string, options?: Partial<Alert>): string {
    return this.addAlert({
      type: 'error',
      priority: 'high',
      title,
      message,
      category: 'error',
      sound: true,
      ...options
    });
  }

  critical(title: string, message: string, options?: Partial<Alert>): string {
    return this.addAlert({
      type: 'critical',
      priority: 'urgent',
      title,
      message,
      category: 'system',
      persistent: true,
      sound: true,
      ...options
    });
  }

  /**
   * Alertes métier spécifiques
   */
  documentExpiringSoon(documentType: 'quote' | 'invoice', documentId: string, daysLeft: number): string {
    return this.warning(
      `${documentType === 'quote' ? 'Devis' : 'Facture'} expirant bientôt`,
      `Le document expire dans ${daysLeft} jour(s)`,
      {
        category: 'document_expiry',
        actions: [
          {
            label: 'Voir le document',
            action: () => window.location.href = `/${documentType}s/${documentId}`
          },
          {
            label: 'Prolonger',
            action: () => console.log('Prolonger document', documentId),
            style: 'primary'
          }
        ],
        metadata: { documentType, documentId, daysLeft }
      }
    );
  }

  paymentOverdue(invoiceId: string, amount: number, daysOverdue: number): string {
    return this.error(
      'Paiement en retard',
      `Facture de ${amount}€ en retard de ${daysOverdue} jour(s)`,
      {
        category: 'payment_overdue',
        actions: [
          {
            label: 'Voir la facture',
            action: () => window.location.href = `/invoices/${invoiceId}`
          },
          {
            label: 'Relancer le client',
            action: () => console.log('Relancer client', invoiceId),
            style: 'primary'
          }
        ],
        metadata: { invoiceId, amount, daysOverdue }
      }
    );
  }

  systemMaintenance(startTime: Date, duration: number): string {
    return this.info(
      'Maintenance programmée',
      `Maintenance système prévue le ${startTime.toLocaleDateString()} pendant ${duration}h`,
      {
        category: 'system_maintenance',
        persistent: true,
        metadata: { startTime, duration }
      }
    );
  }

  cachePerformanceIssue(hitRate: number): string {
    return this.warning(
      'Performance du cache dégradée',
      `Taux de cache faible: ${hitRate.toFixed(1)}%`,
      {
        category: 'performance',
        actions: [
          {
            label: 'Voir les détails',
            action: () => console.log('Show cache details')
          },
          {
            label: 'Vider le cache',
            action: () => console.log('Clear cache'),
            style: 'destructive'
          }
        ],
        metadata: { hitRate }
      }
    );
  }

  /**
   * Gestion des alertes
   */
  markAsRead(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
      this.notifyListeners();
    }
  }

  markAllAsRead(): void {
    this.alerts.forEach(alert => alert.isRead = true);
    this.notifyListeners();
  }

  dismissAlert(alertId: string): void {
    const index = this.alerts.findIndex(a => a.id === alertId);
    if (index !== -1) {
      this.alerts.splice(index, 1);
      this.notifyListeners();
    }
  }

  dismissAll(): void {
    this.alerts = this.alerts.filter(alert => alert.persistent);
    this.notifyListeners();
  }

  dismissByCategory(category: string): void {
    this.alerts = this.alerts.filter(alert => 
      alert.category !== category || alert.persistent
    );
    this.notifyListeners();
  }

  /**
   * Règles d'alertes automatiques
   */
  addRule(rule: Omit<AlertRule, 'id'>): string {
    const newRule: AlertRule = {
      ...rule,
      id: this.generateId()
    };
    this.rules.push(newRule);
    return newRule.id;
  }

  removeRule(ruleId: string): void {
    this.rules = this.rules.filter(rule => rule.id !== ruleId);
  }

  enableRule(ruleId: string): void {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) rule.enabled = true;
  }

  disableRule(ruleId: string): void {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) rule.enabled = false;
  }

  /**
   * Évaluer les règles avec un contexte
   */
  evaluateRules(context: any): void {
    const now = new Date();
    
    this.rules
      .filter(rule => rule.enabled)
      .forEach(rule => {
        // Vérifier le cooldown
        if (rule.cooldown && rule.lastTriggered) {
          const timeSinceLastTrigger = now.getTime() - rule.lastTriggered.getTime();
          if (timeSinceLastTrigger < rule.cooldown) {
            return;
          }
        }

        // Évaluer la condition
        try {
          if (rule.condition(context)) {
            this.addAlert(rule.alertConfig);
            rule.lastTriggered = now;
          }
        } catch (error) {
          console.error(`Erreur lors de l'évaluation de la règle ${rule.name}:`, error);
        }
      });
  }

  /**
   * Listeners et abonnements
   */
  subscribe(listener: (alerts: Alert[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.alerts]));
  }

  /**
   * Paramètres
   */
  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  /**
   * Statistiques
   */
  getStatistics(): {
    total: number;
    unread: number;
    byType: Record<AlertType, number>;
    byPriority: Record<AlertPriority, number>;
    recent: Alert[];
  } {
    const byType: Record<AlertType, number> = {
      info: 0, success: 0, warning: 0, error: 0, critical: 0
    };
    const byPriority: Record<AlertPriority, number> = {
      low: 0, medium: 0, high: 0, urgent: 0
    };

    this.alerts.forEach(alert => {
      byType[alert.type]++;
      byPriority[alert.priority]++;
    });

    return {
      total: this.alerts.length,
      unread: this.alerts.filter(a => !a.isRead).length,
      byType,
      byPriority,
      recent: this.alerts.slice(0, 5)
    };
  }

  /**
   * Méthodes privées
   */
  private setupDefaultRules(): void {
    // Règle pour les erreurs système
    this.addRule({
      name: 'Erreurs système critiques',
      condition: (context) => context.errorCount > 10,
      alertConfig: {
        type: 'critical',
        priority: 'urgent',
        title: 'Erreurs système détectées',
        message: 'Un nombre élevé d\'erreurs a été détecté',
        category: 'system_health'
      },
      cooldown: 300000, // 5 minutes
      enabled: true
    });

    // Règle pour la performance
    this.addRule({
      name: 'Performance dégradée',
      condition: (context) => context.responseTime > 5000,
      alertConfig: {
        type: 'warning',
        priority: 'medium',
        title: 'Performance dégradée',
        message: 'Les temps de réponse sont élevés',
        category: 'performance'
      },
      cooldown: 600000, // 10 minutes
      enabled: true
    });
  }

  private loadSettings(): NotificationSettings {
    try {
      const saved = localStorage.getItem('alert_settings');
      if (saved) {
        return { ...this.getDefaultSettings(), ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Erreur lors du chargement des paramètres d\'alerte:', error);
    }
    return this.getDefaultSettings();
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('alert_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde des paramètres:', error);
    }
  }

  private getDefaultSettings(): NotificationSettings {
    return {
      enabled: true,
      types: {
        info: true,
        success: true,
        warning: true,
        error: true,
        critical: true
      },
      categories: {
        general: true,
        document_expiry: true,
        payment_overdue: true,
        system_maintenance: true,
        performance: true,
        system_health: true,
        error: true,
        system: true
      },
      sound: true,
      desktop: true,
      showOnlyUrgent: false,
      maxVisible: 10
    };
  }

  private async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  private showDesktopNotification(alert: Alert): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(alert.title, {
        body: alert.message,
        icon: '/favicon.ico',
        tag: alert.id
      });
    }
  }

  private playNotificationSound(type: AlertType): void {
    if (!this.soundEnabled) return;

    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    // Différentes fréquences selon le type
    const frequencies = {
      info: 440,
      success: 523,
      warning: 659,
      error: 349,
      critical: 220
    };

    oscillator.frequency.value = frequencies[type];
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.3);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.3);
  }

  private generateId(): string {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Nettoyage
   */
  destroy(): void {
    this.listeners = [];
    this.alerts = [];
    this.rules = [];
  }
}

// Instance globale
export const AlertSystem = new AlertSystemService();
export default AlertSystem;