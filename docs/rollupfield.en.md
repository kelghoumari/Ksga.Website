For a first calculation, read parts 1 to 3. Use the rest as needed.

**Try it without installing anything.** The [interactive demo](solutions/rollupfield/demo) reuses the three examples of this guide: pick a relationship, fill in the form, add filters and functions, then create, edit or delete children and watch the parent recalculate.

## 1. The principle in brief

RollupField calculates fields of a record from the records linked to it, and keeps them up to date. Prerequisite: import the RollupField solution. It adds the KSGA - RollupField app, with two tables: Rollup Configurations and Rollup Functions.

| Word | Meaning in this guide |
| --- | --- |
| Parent | The record that receives the result |
| Child | The linked records the calculation is based on |
| Configuration | A parent / child link with its rules |
| Function | A calculation that fills one field of the parent |
| Trigger | What starts the calculation again |

Two examples come back throughout the guide. Column names starting with `lin_` are made up: replace them with your own.

| | Example A | Example B |
| --- | --- | --- |
| Parent | Contact | Opportunity |
| Child | Opportunity | Opportunity product |
| Columns to fill on the parent | `lin_total_opportunities`, `lin_opportunity_count`, `lin_last_due_date`, `lin_has_open_opportunity` | `lin_products_amount`, `lin_product_count`, `lin_max_discount` |

## 2. Create a configuration

You only need to enter the relationship: the rest fills in by itself. Example A, from the contact to its opportunities.

1. Open the KSGA - RollupField app, the Rollup Configurations table, then New.
2. Enter the relationship between the parent and the child in the Relationships field, for example `opportunity_parent_contact`. For several levels, see 6.1.
3. Save. The form then shows the parent (contact), the child (opportunity) and a name.
4. Set Trigger On Create and Trigger On Delete to Yes if the calculation must follow creations and deletions (see 5).
5. Add the functions in the Functions subgrid (see 3).
6. Leave the configuration active.

The form and the Functions subgrid as the demo shows them for example A (relationship `opportunity_parent_contact`):

![Example A configuration: contact to opportunities, with five functions](docs/img/ex1-config.en.png)

**Good to know**

- The relationship, the parent and the child can no longer be changed after creation: to change them, create a new configuration.
- An inactive configuration is never calculated.
- A new configuration does not recalculate existing records: values appear the next time a child is modified.
- The target columns must exist on the parent before you create the functions.
- Your input is checked on save: a message names the problem (unknown relationship, missing field, invalid filter).

## 3. Calculate

In the Functions subgrid, choose the type, then the source field (child side) and the target field (parent side). The form only shows the fields that matter for the chosen type. Each configuration can hold several functions.

| I want to… | Type | Source field (child) | Target field (parent) | See |
| --- | --- | --- | --- | --- |
| Add up | Sum | Number or amount | Number or amount | 3.1 |
| Calculate an average | Average | Number or amount | Decimal, double or amount | 3.1 |
| Find the smallest or largest value, or a date | Minimum, Maximum | Number, amount or date | Same type as the source | 3.1 |
| Count the children | Count | None | Number | 3.2 |
| Know whether there is at least one child | Any | None | Yes / No | 3.3 |
| Know whether there is no child at all | None | None | Yes / No | 3.3 |
| Know whether all (And) or at least one (Or) are Yes | And, Or | Yes / No | Yes / No | 3.3 |
| Join texts together | Concat | Text | Text | 3.4 |
| Refresh a native Dynamics rollup | Refresh | None | Native rollup | 6.3 |

### 3.1 Sum, average, minimum, maximum

**Need.** The total of the estimated amounts of a contact's opportunities and their latest closing date.

| Example | Type | Source field | Target field |
| --- | --- | --- | --- |
| A | Sum | Estimated amount | `lin_total_opportunities` |
| A | Maximum | Estimated close date | `lin_last_due_date` |
| B | Sum | Product total amount | `lin_products_amount` |
| B | Maximum | Manual discount | `lin_max_discount` |

Result on the contact, with its opportunities. Minimum and Maximum work on dates here:

![A contact and its opportunities: total, count, first and last due date](docs/img/ex1-result.en.png)

Example B, from the opportunity to its products:

![An opportunity and its products: total, count, maximum discount, average price, first and last creation](docs/img/ex2-result.en.png)

The target cannot be a calculated field, a formula, a read-only field or a native rollup. Empty child values are ignored. With no child, a sum or an average is 0 and a date is cleared.

### 3.2 Count

**Need.** The number of opportunities of a contact.

| Example | Type | Source field | Target field |
| --- | --- | --- | --- |
| A | Count | None | `lin_opportunity_count` |
| B | Count | None | `lin_product_count` |

### 3.3 Answer Yes or No

**Need.** Know whether a contact has at least one open opportunity.

| Example | Type | Source field | Target field |
| --- | --- | --- | --- |
| A | Any | None | `lin_has_open_opportunity` |

To look at open opportunities only, add a child filter (see 4.1). With no child, Any and And give No, None gives Yes.

### 3.4 Join texts together

**Need.** A list of opportunity names on the contact record.

| Type | Source field | Separator | Target field |
| --- | --- | --- | --- |
| Concat | Opportunity name | `; ` (required) | `lin_opportunity_list` |

### 3.5 Convert currencies

**Need.** The products of an opportunity are entered in different currencies; the total must be in the opportunity's currency.

**Setting.** On a Sum, Average, Minimum or Maximum function between two amounts, tick Convert currency. The box only appears when the source field and the target field are amounts.

## 4. Limit the calculation

There are two filters, entered in the XML format of Advanced Find. To get the XML: open an Advanced Find on the entity concerned, build the condition, download the FetchXML, then copy the `<filter>` or `<link-entity>` element into the configuration field.

| Filter | Effect | See |
| --- | --- | --- |
| Child Filter | Only the children that meet it enter the calculation | 4.1 |
| Parent Execution Filter | Only the parents that meet it are calculated | 4.2 |

### 4.1 Keep only some children

**Need.** Count only the open opportunities of a contact.

**Setting.** In Child Filter:

```xml
<filter type="and">
  <condition attribute="statecode" operator="eq" value="0" />
</filter>
```

The filter applies to all the functions of the configuration. For a total over all opportunities and a flag over the open ones only, create two configurations (see 6.2). If the filter depends on a field (here `statecode`), add it to the additional fields (see 5.2).

**Variant with a related table.** Keep only the products of a product family:

```xml
<link-entity name="product" from="productid" to="productid" link-type="inner">
  <filter><condition attribute="lin_family" operator="eq" value="1" /></filter>
</link-entity>
```

In the demo, ticking the Open filter leaves out won and lost opportunities: the total, the count and the first due date are recalculated on the three remaining ones.

![Filter on open opportunities: three children kept out of six](docs/img/ex1-filter.en.png)

Same principle with a related table (Services filter on the product):

![Filter on the type of the products](docs/img/ex2-filter.en.png)

### 4.2 Calculate only some parents

**Need.** Calculate only the contacts marked as customers.

**Setting.** In Parent Execution Filter:

```xml
<filter><condition attribute="lin_is_customer" operator="eq" value="1" /></filter>
```

A parent that does not meet the filter is ignored. When a parent starts to meet it, nothing is recalculated right away: the calculation starts again at the next change that triggers the configuration.

**Good to know.** On save, only the XML format is checked. A field name that does not exist only shows up on the first calculation.

## 5. Choose when the calculation runs again

The calculation only runs again because of the configuration's triggers.

| Event | Setting | See |
| --- | --- | --- |
| A child is created | Trigger On Create = Yes | 5.1 |
| A child is deleted | Trigger On Delete = Yes | 5.1 |
| A field of the child is modified | Automatic for source fields; Additional Trigger On Update for the others | 5.2 |
| A child changes parent | Automatic | 5.2 |
| A field of the parent is modified | Parent Trigger On Update | 5.3 |

### 5.1 When a child is created or deleted

**Setting.** Set Trigger On Create and Trigger On Delete to Yes (No by default).

**Example A.** An opportunity is created or deleted: the contact's total and count are updated.

### 5.2 When a child is modified

**Automatic.** The calculation runs again when a source field of a function changes. Example A: changing the estimated amount recalculates the sum.

**Change of parent.** If an opportunity moves from one contact to another, both the old and the new contact are recalculated.

**Other fields.** In Additional Trigger On Update, enter the names of the child fields that must also trigger the calculation, separated by a comma. Example A: `statecode`, because the open-opportunities filter depends on it. The read-only Trigger On Update field shows the full list of child fields that trigger the calculation.

### 5.3 When the parent is modified

**Need.** Run the calculation again when a field of the parent changes, without any child changing.

**Setting.** In Parent Trigger On Update, enter the names of parent fields, for example `lin_segment`. When one of them changes, the configuration runs for that parent, with its execution filter.

A field filled by the functions of the same configuration never triggers it.

The additional fields and the parent fields offer a list of suggestions while you type, and reject a name that does not exist.

## 6. Advanced cases

### 6.1 Roll up across several levels

**Need.** The total of the products of all of a contact's opportunities (example C).

**Setting.** In Relationships, enter the relationships from the parent down to the child, separated by a comma: `opportunity_parent_contact,product_opportunities`. The parent is the contact, the child is the opportunity product.

| Type | Source field | Target field |
| --- | --- | --- |
| Sum | Product total amount | `lin_total_products` |

The demo shows this case as its third example:

![Two levels: a contact and the products of all its opportunities](docs/img/ex3-result.en.png)

If an opportunity moves to another contact, the totals of the old and the new contact are updated the next time one of its products is modified.

### 6.2 Several calculations on the same relationship

**Need.** On the contact, a total over all opportunities, a flag for the open ones and a total for the won ones. Since the child filter applies to the whole configuration, you create one configuration per case.

| Configuration | Child Filter | Function | Target field |
| --- | --- | --- | --- |
| All opportunities | None | Sum of estimated amount | `lin_total_opportunities` |
| Open opportunities | Status = open | Any | `lin_has_open_opportunity` |
| Won opportunities | Status = won | Sum of actual amount | `lin_total_won` |

Each configuration has its own filters and its own target fields. If two configurations write to the same field, the most recent one wins: avoid this.

### 6.3 Refresh a native Dynamics rollup

**Need.** Dynamics recalculates a native rollup about once an hour. You want it recalculated at the right moment (example D).

**Setting.** Create a contact-to-opportunity configuration that holds only one Refresh function pointing to the rollup, for example `lin_won_native`. Then fill in:

- Additional Trigger On Update: `statecode`, `actualvalue`, the opportunity fields the rollup depends on;
- Parent Trigger On Update: `lin_segment`, a contact field it depends on.

A configuration that holds only Refresh functions reads no child. With no trigger field at all, it runs again at every opportunity modification.

## 7. Synchronous or asynchronous

The Execution Mode field chooses when the calculation runs. You can mix both modes, and a change applies immediately.

| | Synchronous (No, default) | Asynchronous (Yes) |
| --- | --- | --- |
| When | While the modified record is being saved | In the background, right after |
| Parent up to date | Immediately | A few seconds later |
| On error | The save is refused, with a message | The save is kept; the error shows in the system jobs |
| Choose it when | Few children per parent, result needed right away | Many children, or bulk loads |

**Example B** (products of an opportunity): synchronous. **Example A** for a contact linked to thousands of opportunities: asynchronous, so saving is not slowed down.

## 8. Export and import

To move configurations from one environment to another, for example from development to production, the Rollup Configurations grid has two buttons.

1. **Export.** Select the configurations, click Export, save the file. It contains the configurations with all their functions.
2. **Import.** In the target environment, click Import and choose the file. An analysis tells you, for each configuration and each function: create, update, identical, or refused with the reason.
3. Tick the confirmation box, which reminds you of the target environment, then start the import. Nothing is written before this.

The columns and relationships used must already exist in the target environment. A refused item is skipped along with its functions; the others are imported. Importing the same file twice updates the existing configurations. An animation at the end of this guide (part 10) shows this journey in a browser.

## 9. Reference: the fields of a configuration

| Field | Input | Role | See |
| --- | --- | --- | --- |
| Relationships | At creation only | Relationships between the parent and the child, separated by a comma | 2, 6.1 |
| Configuration name | Optional | Built from the relationships if empty | 2 |
| Parent Entity, Child Entity, Lookup Path | Automatic | Derived from the relationships, cannot be changed | 2 |
| Child Filter | Optional | Keeps only the children that meet the filter | 4.1 |
| Parent Execution Filter | Optional | Calculates only the parents that meet the filter | 4.2 |
| Trigger On Create | Yes / No (No) | Recalculates when a child is created | 5.1 |
| Trigger On Delete | Yes / No (No) | Recalculates when a child is deleted | 5.1 |
| Additional Trigger On Update | Optional | Child fields that trigger the calculation | 5.2 |
| Trigger On Update | Read-only | Full list of child fields that trigger the calculation | 5.2 |
| Parent Trigger On Update | Optional | Parent fields that trigger the configuration | 5.3 |
| Execution Mode | No / Yes (No) | No = synchronous, Yes = asynchronous | 7 |
| Status | Active / Inactive | An inactive configuration is never calculated | 2 |

## 10. Export and import, animated

The journey of part 8, step by step in a browser: export the three demo configurations from development, then import them into production. Follow the guide by clicking the highlighted items, or start the autoplay.
