/**
 * Features - Exports centralisés
 * Architecture feature-based pour organiser le code par domaine métier
 */

// Auth Feature - Service d'authentification et gestion utilisateur
export * as Auth from './auth';

// CRM Feature - Service de gestion de la relation client (Tiers + Opportunités)
export * as CRM from './crm';

// Documents Feature - Service de gestion des documents (Devis + Factures)
export * as Documents from './documents';

// Library Feature - Service bibliothèque d'ouvrages BTP
export * as Library from './library';

// Admin Feature - Service d'administration des utilisateurs et rôles
export * as Admin from './admin';