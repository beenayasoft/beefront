Ce dossier regroupe les operations CRUD pour chaque tables presents dansla base de donné, elle doit servir de reference afin de faire le bon remplacement pour migrer tous les endpoints localhost vers supabase.

voici la liste des tables existantes

| table_schema | table_name                             |
| ------------ | -------------------------------------- |
| public       | django_migrations                      |
| public       | django_content_type                    |
| public       | bibliotheque_mainoeuvre                |
| public       | bibliotheque_ingredientouvrage         |
| public       | auth_permission                        |
| public       | bibliotheque_categorie                 |
| public       | bibliotheque_fourniture                |
| public       | auth_group                             |
| public       | auth_group_permissions                 |
| public       | authentification_user_groups           |
| public       | authentification_user_user_permissions |
| public       | django_admin_log                       |
| public       | bibliotheque_ouvrage                   |
| public       | tiers_contact                          |
| public       | tiers_adresse                          |
| public       | tiers_activitetiers                    |
| public       | devis_quoteitem                        |
| public       | devis_quote                            |
| public       | django_session                         |
| public       | token_blacklist_blacklistedtoken       |
| public       | opportunite_opportunity                |
| public       | tiers_tiers                            |
| public       | token_blacklist_outstandingtoken       |
| public       | facturation_invoice                    |
| public       | facturation_invoiceitem                |
| public       | facturation_payment                    |
| public       | authentification_user                  |


ci dessous la liste pour chaque tables de ces colonnes et attributs et si il est champ d'une clé etrangere

[
  {
    "table_name": "auth_group",
    "column_name": "id",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "auth_group",
    "column_name": "name",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "auth_group_permissions",
    "column_name": "id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "auth_group_permissions",
    "column_name": "group_id",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "auth_group_permissions",
    "column_name": "group_id",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "auth_group_permissions",
    "column_name": "permission_id",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "auth_group_permissions",
    "column_name": "permission_id",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "auth_permission",
    "column_name": "id",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "auth_permission",
    "column_name": "name",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "auth_permission",
    "column_name": "content_type_id",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "auth_permission",
    "column_name": "content_type_id",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "auth_permission",
    "column_name": "codename",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "authentification_user",
    "column_name": "id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "authentification_user",
    "column_name": "password",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "authentification_user",
    "column_name": "last_login",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "authentification_user",
    "column_name": "is_superuser",
    "data_type": "boolean",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "authentification_user",
    "column_name": "username",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "authentification_user",
    "column_name": "first_name",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "authentification_user",
    "column_name": "last_name",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "authentification_user",
    "column_name": "is_staff",
    "data_type": "boolean",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "authentification_user",
    "column_name": "is_active",
    "data_type": "boolean",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "authentification_user",
    "column_name": "date_joined",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "authentification_user",
    "column_name": "email",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "authentification_user",
    "column_name": "company",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "authentification_user_groups",
    "column_name": "id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "authentification_user_groups",
    "column_name": "user_id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "authentification_user_groups",
    "column_name": "user_id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "authentification_user_groups",
    "column_name": "group_id",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "authentification_user_groups",
    "column_name": "group_id",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "authentification_user_user_permissions",
    "column_name": "id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "authentification_user_user_permissions",
    "column_name": "user_id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "authentification_user_user_permissions",
    "column_name": "user_id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "authentification_user_user_permissions",
    "column_name": "permission_id",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "authentification_user_user_permissions",
    "column_name": "permission_id",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "bibliotheque_categorie",
    "column_name": "id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_categorie",
    "column_name": "nom",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_categorie",
    "column_name": "parent_id",
    "data_type": "bigint",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "bibliotheque_categorie",
    "column_name": "position",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_fourniture",
    "column_name": "id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_fourniture",
    "column_name": "nom",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_fourniture",
    "column_name": "unite",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_fourniture",
    "column_name": "prix_achat_ht",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_fourniture",
    "column_name": "description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_fourniture",
    "column_name": "reference",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_fourniture",
    "column_name": "categorie_id",
    "data_type": "bigint",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "bibliotheque_fourniture",
    "column_name": "code",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_fourniture",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_fourniture",
    "column_name": "supplier",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_fourniture",
    "column_name": "type",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_fourniture",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_fourniture",
    "column_name": "vat_rate",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_fourniture",
    "column_name": "fournisseur",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_fourniture",
    "column_name": "taux_tva",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_ingredientouvrage",
    "column_name": "id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_ingredientouvrage",
    "column_name": "element_id",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_ingredientouvrage",
    "column_name": "quantite",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_ingredientouvrage",
    "column_name": "element_type_id",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "bibliotheque_ingredientouvrage",
    "column_name": "element_type_id",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_ingredientouvrage",
    "column_name": "ouvrage_id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_ingredientouvrage",
    "column_name": "ouvrage_id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "bibliotheque_mainoeuvre",
    "column_name": "id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_mainoeuvre",
    "column_name": "nom",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_mainoeuvre",
    "column_name": "cout_horaire",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_mainoeuvre",
    "column_name": "description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_mainoeuvre",
    "column_name": "categorie_id",
    "data_type": "bigint",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "bibliotheque_mainoeuvre",
    "column_name": "code",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_mainoeuvre",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_mainoeuvre",
    "column_name": "type",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_mainoeuvre",
    "column_name": "unite",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_mainoeuvre",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_ouvrage",
    "column_name": "id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_ouvrage",
    "column_name": "nom",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_ouvrage",
    "column_name": "unite",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_ouvrage",
    "column_name": "description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_ouvrage",
    "column_name": "code",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_ouvrage",
    "column_name": "categorie_id",
    "data_type": "bigint",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "bibliotheque_ouvrage",
    "column_name": "complexity",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_ouvrage",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_ouvrage",
    "column_name": "efficiency",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_ouvrage",
    "column_name": "is_custom",
    "data_type": "boolean",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_ouvrage",
    "column_name": "marge",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_ouvrage",
    "column_name": "prix_recommande",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_ouvrage",
    "column_name": "type",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "bibliotheque_ouvrage",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quote",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quote",
    "column_name": "number",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quote",
    "column_name": "status",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quote",
    "column_name": "client_name",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quote",
    "column_name": "client_address",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quote",
    "column_name": "issue_date",
    "data_type": "date",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quote",
    "column_name": "expiry_date",
    "data_type": "date",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quote",
    "column_name": "validity_period",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quote",
    "column_name": "notes",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quote",
    "column_name": "terms_and_conditions",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quote",
    "column_name": "total_ht",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quote",
    "column_name": "total_vat",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quote",
    "column_name": "total_ttc",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quote",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quote",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quote",
    "column_name": "created_by",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quote",
    "column_name": "updated_by",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quote",
    "column_name": "tier_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "devis_quote",
    "column_name": "opportunity_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "devis_quoteitem",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quoteitem",
    "column_name": "type",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quoteitem",
    "column_name": "position",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quoteitem",
    "column_name": "reference",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quoteitem",
    "column_name": "designation",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quoteitem",
    "column_name": "description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quoteitem",
    "column_name": "unit",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quoteitem",
    "column_name": "quantity",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quoteitem",
    "column_name": "unit_price",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quoteitem",
    "column_name": "discount",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quoteitem",
    "column_name": "vat_rate",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quoteitem",
    "column_name": "margin",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quoteitem",
    "column_name": "total_ht",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quoteitem",
    "column_name": "total_ttc",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quoteitem",
    "column_name": "work_id",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quoteitem",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quoteitem",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "devis_quoteitem",
    "column_name": "parent_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "devis_quoteitem",
    "column_name": "quote_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "django_admin_log",
    "column_name": "id",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "django_admin_log",
    "column_name": "action_time",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "django_admin_log",
    "column_name": "object_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "django_admin_log",
    "column_name": "object_repr",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "django_admin_log",
    "column_name": "action_flag",
    "data_type": "smallint",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "django_admin_log",
    "column_name": "change_message",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "django_admin_log",
    "column_name": "content_type_id",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "django_admin_log",
    "column_name": "user_id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "django_content_type",
    "column_name": "id",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "django_content_type",
    "column_name": "app_label",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "django_content_type",
    "column_name": "model",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "django_migrations",
    "column_name": "id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "django_migrations",
    "column_name": "app",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "django_migrations",
    "column_name": "name",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "django_migrations",
    "column_name": "applied",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "django_session",
    "column_name": "session_key",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "django_session",
    "column_name": "session_data",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "django_session",
    "column_name": "expire_date",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoice",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoice",
    "column_name": "number",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoice",
    "column_name": "status",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoice",
    "column_name": "client_name",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoice",
    "column_name": "client_address",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoice",
    "column_name": "project_name",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoice",
    "column_name": "project_address",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoice",
    "column_name": "project_reference",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoice",
    "column_name": "issue_date",
    "data_type": "date",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoice",
    "column_name": "due_date",
    "data_type": "date",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoice",
    "column_name": "payment_terms",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoice",
    "column_name": "notes",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoice",
    "column_name": "terms_and_conditions",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoice",
    "column_name": "total_ht",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoice",
    "column_name": "total_vat",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoice",
    "column_name": "total_ttc",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoice",
    "column_name": "paid_amount",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoice",
    "column_name": "remaining_amount",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoice",
    "column_name": "quote_number",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoice",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoice",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoice",
    "column_name": "created_by",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoice",
    "column_name": "updated_by",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoice",
    "column_name": "credit_note_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "facturation_invoice",
    "column_name": "original_invoice_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "facturation_invoice",
    "column_name": "quote_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "facturation_invoice",
    "column_name": "tier_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "facturation_invoice",
    "column_name": "is_credit_note",
    "data_type": "boolean",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoiceitem",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoiceitem",
    "column_name": "type",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoiceitem",
    "column_name": "position",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoiceitem",
    "column_name": "reference",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoiceitem",
    "column_name": "designation",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoiceitem",
    "column_name": "description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoiceitem",
    "column_name": "unit",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoiceitem",
    "column_name": "quantity",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoiceitem",
    "column_name": "unit_price",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoiceitem",
    "column_name": "discount",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoiceitem",
    "column_name": "vat_rate",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoiceitem",
    "column_name": "total_ht",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoiceitem",
    "column_name": "total_ttc",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoiceitem",
    "column_name": "work_id",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_invoiceitem",
    "column_name": "invoice_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "facturation_invoiceitem",
    "column_name": "parent_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "facturation_payment",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_payment",
    "column_name": "date",
    "data_type": "date",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_payment",
    "column_name": "amount",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_payment",
    "column_name": "method",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_payment",
    "column_name": "reference",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_payment",
    "column_name": "notes",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_payment",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "facturation_payment",
    "column_name": "invoice_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "opportunite_opportunity",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "opportunite_opportunity",
    "column_name": "name",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "opportunite_opportunity",
    "column_name": "stage",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "opportunite_opportunity",
    "column_name": "estimated_amount",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "opportunite_opportunity",
    "column_name": "probability",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "opportunite_opportunity",
    "column_name": "expected_close_date",
    "data_type": "date",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "opportunite_opportunity",
    "column_name": "source",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "opportunite_opportunity",
    "column_name": "description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "opportunite_opportunity",
    "column_name": "assigned_to",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "opportunite_opportunity",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "opportunite_opportunity",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "opportunite_opportunity",
    "column_name": "closed_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "opportunite_opportunity",
    "column_name": "loss_reason",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "opportunite_opportunity",
    "column_name": "loss_description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "opportunite_opportunity",
    "column_name": "project_id",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "opportunite_opportunity",
    "column_name": "tier_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "tiers_activitetiers",
    "column_name": "id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_activitetiers",
    "column_name": "type",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_activitetiers",
    "column_name": "contenu",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_activitetiers",
    "column_name": "date",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_activitetiers",
    "column_name": "utilisateur_id",
    "data_type": "bigint",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "tiers_activitetiers",
    "column_name": "tier_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "tiers_adresse",
    "column_name": "id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_adresse",
    "column_name": "libelle",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_adresse",
    "column_name": "rue",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_adresse",
    "column_name": "ville",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_adresse",
    "column_name": "code_postal",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_adresse",
    "column_name": "pays",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_adresse",
    "column_name": "facturation",
    "data_type": "boolean",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_adresse",
    "column_name": "date_creation",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_adresse",
    "column_name": "date_modification",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_adresse",
    "column_name": "tier_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "tiers_contact",
    "column_name": "id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_contact",
    "column_name": "nom",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_contact",
    "column_name": "prenom",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_contact",
    "column_name": "fonction",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_contact",
    "column_name": "email",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_contact",
    "column_name": "telephone",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_contact",
    "column_name": "contact_principal_devis",
    "data_type": "boolean",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_contact",
    "column_name": "contact_principal_facture",
    "data_type": "boolean",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_contact",
    "column_name": "date_creation",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_contact",
    "column_name": "date_modification",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_contact",
    "column_name": "tier_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "tiers_tiers",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_tiers",
    "column_name": "type",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_tiers",
    "column_name": "nom",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_tiers",
    "column_name": "siret",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_tiers",
    "column_name": "tva",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_tiers",
    "column_name": "is_deleted",
    "data_type": "boolean",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_tiers",
    "column_name": "date_creation",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_tiers",
    "column_name": "date_modification",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_tiers",
    "column_name": "date_archivage",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "tiers_tiers",
    "column_name": "assigned_user_id",
    "data_type": "bigint",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "tiers_tiers",
    "column_name": "relation",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "token_blacklist_blacklistedtoken",
    "column_name": "id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "token_blacklist_blacklistedtoken",
    "column_name": "blacklisted_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "token_blacklist_blacklistedtoken",
    "column_name": "token_id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "token_blacklist_blacklistedtoken",
    "column_name": "token_id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "token_blacklist_outstandingtoken",
    "column_name": "id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "token_blacklist_outstandingtoken",
    "column_name": "token",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "token_blacklist_outstandingtoken",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "token_blacklist_outstandingtoken",
    "column_name": "expires_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  },
  {
    "table_name": "token_blacklist_outstandingtoken",
    "column_name": "user_id",
    "data_type": "bigint",
    "is_nullable": "YES",
    "column_default": null,
    "is_foreign_key": "YES"
  },
  {
    "table_name": "token_blacklist_outstandingtoken",
    "column_name": "jti",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "is_foreign_key": "NO"
  }
]