Pour un premier calcul, lire les parties 1 à 3. Le reste se consulte selon le besoin.

**Tester sans rien installer.** La [démo interactive](solutions/rollupfield/demo) reprend les trois exemples de ce guide : on choisit une relation, on remplit le formulaire, on ajoute des filtres et des fonctions, puis on crée, modifie ou supprime des enfants pour voir le parent se recalculer.

## 1. Le principe en bref

RollupField calcule des champs d'une fiche à partir des fiches qui lui sont liées, et les garde à jour. Prérequis : importer la solution RollupField. Elle ajoute l'application KSGA - RollupField, avec deux tables : Rollup Configurations et Rollup Functions.

| Mot | Sens dans ce guide |
| --- | --- |
| Parent | La fiche qui reçoit le résultat |
| Enfant | Les fiches liées sur lesquelles on calcule |
| Configuration | Un lien parent / enfant avec ses règles |
| Fonction | Un calcul qui remplit un champ du parent |
| Déclencheur | Ce qui relance le calcul |

Deux exemples reviennent dans tout le guide. Les noms de colonnes en `lin_` sont inventés : à remplacer par les vôtres.

| | Exemple A | Exemple B |
| --- | --- | --- |
| Parent | Contact | Opportunité |
| Enfant | Opportunité | Produit d'opportunité |
| Colonnes à remplir sur le parent | `lin_total_opportunities`, `lin_opportunity_count`, `lin_last_due_date`, `lin_has_open_opportunity` | `lin_products_amount`, `lin_product_count`, `lin_max_discount` |

## 2. Créer une configuration

Il suffit de saisir la relation : le reste se remplit tout seul. Exemple A, du contact vers ses opportunités.

1. Ouvrir l'application KSGA - RollupField, table Rollup Configurations, puis Nouveau.
2. Saisir la relation entre le parent et l'enfant dans le champ Relationships, par exemple `opportunity_parent_contact`. Plusieurs niveaux : voir 6.1.
3. Enregistrer. Le formulaire affiche alors le parent (contact), l'enfant (opportunity) et un nom.
4. Mettre Trigger On Create et Trigger On Delete à Oui si le calcul doit suivre les créations et les suppressions (voir 5).
5. Ajouter les fonctions dans la sous-grille Fonctions (voir 3).
6. Laisser la configuration active.

Le formulaire et la sous-grille Fonctions, tels que la démo les présente pour l'exemple A (relation `opportunity_parent_contact`) :

![Configuration de l'exemple A : contact vers opportunités, avec cinq fonctions](docs/img/ex1-config.fr.png)

**À savoir**

- La relation, le parent et l'enfant ne sont plus modifiables après la création : pour en changer, créer une nouvelle configuration.
- Une configuration inactive n'est jamais calculée.
- Une nouvelle configuration ne recalcule pas les fiches existantes : les valeurs apparaissent à la prochaine modification d'un enfant.
- Les colonnes cibles doivent exister sur le parent avant de créer les fonctions.
- La saisie est vérifiée à l'enregistrement : un message nomme le problème (relation inconnue, champ inexistant, filtre invalide).

## 3. Calculer

Dans la sous-grille Fonctions, choisir le type, puis le champ source (côté enfant) et le champ cible (côté parent). Le formulaire n'affiche que les champs utiles au type choisi. Chaque configuration peut contenir plusieurs fonctions.

| Je veux… | Type | Champ source (enfant) | Champ cible (parent) | Voir |
| --- | --- | --- | --- | --- |
| Additionner | Sum | Nombre ou montant | Nombre ou montant | 3.1 |
| Faire une moyenne | Average | Nombre ou montant | Décimal, double ou montant | 3.1 |
| Trouver la plus petite ou la plus grande valeur, ou une date | Minimum, Maximum | Nombre, montant ou date | Même type que la source | 3.1 |
| Compter les enfants | Count | Aucun | Nombre | 3.2 |
| Savoir s'il y a au moins un enfant | Any | Aucun | Oui / Non | 3.3 |
| Savoir s'il n'y a aucun enfant | None | Aucun | Oui / Non | 3.3 |
| Savoir si tous (And) ou au moins un (Or) valent Oui | And, Or | Oui / Non | Oui / Non | 3.3 |
| Assembler des textes | Concat | Texte | Texte | 3.4 |
| Rafraîchir un cumul natif de Dynamics | Refresh | Aucun | Cumul natif | 6.3 |

### 3.1 Additionner, moyenne, minimum, maximum

**Besoin.** Le total des montants estimés des opportunités d'un contact et leur dernière date de clôture.

| Exemple | Type | Champ source | Champ cible |
| --- | --- | --- | --- |
| A | Sum | Montant estimé | `lin_total_opportunities` |
| A | Maximum | Date de clôture estimée | `lin_last_due_date` |
| B | Sum | Montant total du produit | `lin_products_amount` |
| B | Maximum | Remise manuelle | `lin_max_discount` |

Résultat côté contact, avec ses opportunités. Les fonctions Minimum et Maximum portent ici sur des dates :

![Un contact et ses opportunités : total, nombre, première et dernière échéance](docs/img/ex1-result.fr.png)

Exemple B, de l'opportunité vers ses produits :

![Une opportunité et ses produits : total, nombre, remise maximale, prix moyen, première et dernière création](docs/img/ex2-result.fr.png)

La cible ne peut pas être un champ calculé, une formule, un champ non modifiable ou un cumul natif. Les valeurs vides des enfants sont ignorées. Sans enfant, une somme ou une moyenne vaut 0 et une date est vidée.

### 3.2 Compter

**Besoin.** Le nombre d'opportunités d'un contact.

| Exemple | Type | Champ source | Champ cible |
| --- | --- | --- | --- |
| A | Count | Aucun | `lin_opportunity_count` |
| B | Count | Aucun | `lin_product_count` |

### 3.3 Répondre par Oui ou Non

**Besoin.** Savoir si un contact a au moins une opportunité ouverte.

| Exemple | Type | Champ source | Champ cible |
| --- | --- | --- | --- |
| A | Any | Aucun | `lin_has_open_opportunity` |

Pour ne regarder que les opportunités ouvertes, ajouter un filtre enfants (voir 4.1). Sans enfant, Any et And donnent Non, None donne Oui.

### 3.4 Assembler des textes

**Besoin.** Une liste des noms d'opportunités sur la fiche du contact.

| Type | Champ source | Séparateur | Champ cible |
| --- | --- | --- | --- |
| Concat | Nom de l'opportunité | `; ` (obligatoire) | `lin_opportunity_list` |

### 3.5 Convertir les devises

**Besoin.** Les produits d'une opportunité sont saisies dans des devises différentes ; le total doit être dans la devise de l'opportunité.

**Réglage.** Sur une fonction Sum, Average, Minimum ou Maximum entre deux montants, cocher Convertir la devise. La case n'apparaît que si le champ source et le champ cible sont des montants.

## 4. Limiter le calcul

Deux filtres existent, saisis au format XML des recherches avancées. Pour obtenir le XML : ouvrir une recherche avancée sur l'entité concernée, construire la condition, télécharger le FetchXML, puis copier l'élément `<filter>` ou `<link-entity>` dans le champ de la configuration.

| Filtre | Effet | Voir |
| --- | --- | --- |
| Child Filter | Seuls les enfants qui le satisfont entrent dans le calcul | 4.1 |
| Parent Execution Filter | Seuls les parents qui le satisfont sont calculés | 4.2 |

### 4.1 Ne garder que certains enfants

**Besoin.** Ne compter que les opportunités ouvertes d'un contact.

**Réglage.** Dans Child Filter :

```xml
<filter type="and">
  <condition attribute="statecode" operator="eq" value="0" />
</filter>
```

Le filtre s'applique à toutes les fonctions de la configuration. Pour un total sur toutes les opportunités et un indicateur sur les ouvertes seulement, créer deux configurations (voir 6.2). Si le filtre dépend d'un champ (ici `statecode`), l'ajouter aux champs supplémentaires (voir 5.2).

**Variante avec une table liée.** Ne garder que les produits d'une famille :

```xml
<link-entity name="product" from="productid" to="productid" link-type="inner">
  <filter><condition attribute="lin_family" operator="eq" value="1" /></filter>
</link-entity>
```

Dans la démo, cocher le filtre « Ouvertes » exclut les opportunités gagnées et perdues : le total, le nombre et la première échéance sont recalculés sur les trois restantes.

![Filtre sur les opportunités ouvertes : trois enfants retenus sur six](docs/img/ex1-filter.fr.png)

Même principe avec une table liée (filtre « Services » sur le produit) :

![Filtre sur le type des produits](docs/img/ex2-filter.fr.png)

### 4.2 Ne calculer que certains parents

**Besoin.** Ne calculer que les contacts marqués client.

**Réglage.** Dans Parent Execution Filter :

```xml
<filter><condition attribute="lin_is_customer" operator="eq" value="1" /></filter>
```

Un parent qui ne satisfait pas le filtre est ignoré. Quand un parent devient conforme, rien n'est recalculé sur le moment : le calcul repart à la prochaine modification qui déclenche la configuration.

**À savoir.** À l'enregistrement, seul le format XML est contrôlé. Un nom de champ inexistant n'apparaît qu'au premier calcul.

## 5. Choisir quand le calcul est refait

Le calcul n'est relancé que par les déclencheurs de la configuration.

| Événement | Réglage | Voir |
| --- | --- | --- |
| Création d'un enfant | Trigger On Create = Oui | 5.1 |
| Suppression d'un enfant | Trigger On Delete = Oui | 5.1 |
| Modification d'un champ de l'enfant | Automatique pour les champs source ; Additional Trigger On Update pour les autres | 5.2 |
| Changement de parent d'un enfant | Automatique | 5.2 |
| Modification d'un champ du parent | Parent Trigger On Update | 5.3 |

### 5.1 À la création ou à la suppression d'un enfant

**Réglage.** Mettre Trigger On Create et Trigger On Delete à Oui (Non par défaut).

**Exemple A.** Une opportunité est créée ou supprimée : le total et le nombre du contact sont mis à jour.

### 5.2 À la modification d'un enfant

**Automatique.** Le calcul se relance quand un champ source d'une fonction change. Exemple A : modifier le montant estimé relance la somme.

**Changement de parent.** Si une opportunité passe d'un contact à un autre, l'ancien et le nouveau contact sont recalculés.

**Autres champs.** Saisir dans Additional Trigger On Update les noms de champs de l'enfant qui doivent aussi relancer le calcul, séparés par une virgule. Exemple A : `statecode`, parce que le filtre des opportunités ouvertes en dépend. Le champ Trigger On Update, en lecture seule, montre la liste complète des champs de l'enfant qui relancent le calcul.

### 5.3 À la modification du parent

**Besoin.** Refaire le calcul quand un champ du parent change, sans qu'aucun enfant ne bouge.

**Réglage.** Saisir dans Parent Trigger On Update les noms de champs du parent, par exemple `lin_segment`. Quand l'un d'eux change, la configuration est exécutée pour ce parent, avec son filtre d'exécution.

Un champ rempli par les fonctions de la même configuration ne la déclenche jamais.

Les champs supplémentaires et les champs du parent proposent une liste de suggestions pendant la saisie et refusent un nom qui n'existe pas.

## 6. Cas avancés

### 6.1 Cumuler sur plusieurs niveaux

**Besoin.** Le total des produits de toutes les opportunités d'un contact (exemple C).

**Réglage.** Dans Relationships, saisir les relations du parent vers l'enfant, séparées par une virgule : `opportunity_parent_contact,product_opportunities`. Le parent est le contact, l'enfant est le produit d'opportunité.

| Type | Champ source | Champ cible |
| --- | --- | --- |
| Sum | Montant total du produit | `lin_total_products` |

La démo présente ce cas comme troisième exemple :

![Deux niveaux : un contact et les produits de toutes ses opportunités](docs/img/ex3-result.fr.png)

Si une opportunité change de contact, les totaux de l'ancien et du nouveau contact sont mis à jour à la prochaine modification d'un de ses produits.

### 6.2 Plusieurs calculs sur la même relation

**Besoin.** Sur le contact, un total sur toutes les opportunités, un indicateur sur les ouvertes et un total sur les gagnées. Le filtre enfants s'appliquant à toute la configuration, on crée une configuration par cas.

| Configuration | Child Filter | Fonction | Champ cible |
| --- | --- | --- | --- |
| Toutes les opportunités | Aucun | Sum du montant estimé | `lin_total_opportunities` |
| Opportunités ouvertes | État = ouvert | Any | `lin_has_open_opportunity` |
| Opportunités gagnées | État = gagné | Sum du montant réel | `lin_total_won` |

Chaque configuration a ses propres filtres et ses propres champs cibles. Si deux configurations écrivent dans le même champ, la plus récente l'emporte : l'éviter.

### 6.3 Rafraîchir un cumul natif de Dynamics

**Besoin.** Un cumul natif est recalculé par Dynamics environ toutes les heures. On veut qu'il le soit au bon moment (exemple D).

**Réglage.** Créer une configuration contact vers opportunité qui ne contient qu'une fonction Refresh vers le cumul, par exemple `lin_won_native`. Puis renseigner :

- Additional Trigger On Update : `statecode`, `actualvalue`, les champs de l'opportunité dont dépend le cumul ;
- Parent Trigger On Update : `lin_segment`, un champ du contact dont il dépend.

Une configuration qui ne contient que des Refresh ne lit aucun enfant. Sans aucun champ déclencheur, elle se relance à chaque modification d'une opportunité.

## 7. Synchrone ou asynchrone

Le champ Execution Mode choisit quand le calcul s'exécute. On peut mélanger les deux modes, et un changement s'applique tout de suite.

| | Synchrone (Non, par défaut) | Asynchrone (Oui) |
| --- | --- | --- |
| Quand | Pendant l'enregistrement de la fiche modifiée | En arrière-plan, juste après |
| Parent à jour | Immédiatement | Quelques secondes plus tard |
| En cas d'erreur | L'enregistrement est refusé, avec un message | L'enregistrement est conservé ; l'erreur se voit dans les travaux système |
| À choisir si | Peu d'enfants par parent, résultat attendu tout de suite | Beaucoup d'enfants, ou chargements en masse |

**Exemple B** (produits d'une opportunité) : synchrone. **Exemple A** pour un contact lié à des milliers d'opportunités : asynchrone, pour ne pas ralentir l'enregistrement.

## 8. Exporter et importer

Pour reprendre des configurations d'un environnement à un autre, par exemple du développement vers la production, la grille Rollup Configurations a deux boutons.

1. **Exporter.** Sélectionner les configurations, cliquer sur Exporter, enregistrer le fichier. Il contient les configurations avec toutes leurs fonctions.
2. **Importer.** Dans l'environnement cible, cliquer sur Importer et choisir le fichier. Une analyse indique pour chaque configuration et chaque fonction : créer, modifier, identique, ou refus avec la raison.
3. Cocher la case de confirmation, qui rappelle l'environnement cible, puis lancer l'import. Rien n'est écrit avant.

Les colonnes et les relations utilisées doivent déjà exister dans l'environnement cible. Un élément refusé est ignoré avec ses fonctions ; les autres sont importés. Importer deux fois le même fichier met à jour les configurations existantes. Une animation à la fin de ce guide (partie 10) montre ce parcours dans un navigateur.

## 9. Référence : les champs d'une configuration

| Champ | Saisie | Rôle | Voir |
| --- | --- | --- | --- |
| Relationships | À la création seulement | Relations entre le parent et l'enfant, séparées par une virgule | 2, 6.1 |
| Nom de la configuration | Facultative | Formé des relations s'il est vide | 2 |
| Parent Entity, Child Entity, Lookup Path | Automatique | Déduits des relations, non modifiables | 2 |
| Child Filter | Facultative | Ne garde que les enfants qui satisfont le filtre | 4.1 |
| Parent Execution Filter | Facultative | Ne calcule que les parents qui satisfont le filtre | 4.2 |
| Trigger On Create | Oui / Non (Non) | Recalcule à la création d'un enfant | 5.1 |
| Trigger On Delete | Oui / Non (Non) | Recalcule à la suppression d'un enfant | 5.1 |
| Additional Trigger On Update | Facultative | Champs de l'enfant qui relancent le calcul | 5.2 |
| Trigger On Update | Lecture seule | Liste complète des champs de l'enfant qui relancent le calcul | 5.2 |
| Parent Trigger On Update | Facultative | Champs du parent qui relancent la configuration | 5.3 |
| Execution Mode | Non / Oui (Non) | Non = synchrone, Oui = asynchrone | 7 |
| État | Actif / Inactif | Une configuration inactive n'est jamais calculée | 2 |

## 10. L'export et l'import en animation

Le parcours de la partie 8, pas à pas dans un navigateur : on exporte les trois configurations de la démo depuis le développement, puis on les importe en production. Suivez le guide en cliquant sur les éléments surlignés, ou lancez la lecture automatique.
