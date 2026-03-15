# Editorial — Product Sales Analysis I

## Problem Summary

Join Sales with Product to get the product name for each sale.

## Approach: Simple JOIN

```sql
SELECT p.product_name, s.year, s.price
FROM Sales s
JOIN Product p ON s.product_id = p.product_id;
```

**Explanation:**
1. Join Sales with Product on product_id.
2. Select the required columns: product_name, year, price.

This is a straightforward join problem.

## Key Insight

This tests basic JOIN skills. An INNER JOIN suffices since every sale has a valid product_id. No aggregation or filtering needed.
