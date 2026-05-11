---
name: Branch coverage for ternary in map()
description: map() with id-matching ternary needs 2+ items in the array so the non-matching (else) branch is executed
type: feedback
---

In CartContext.tsx, `addItem` and `updateQuantity` use `prev.map((i) => i.id === target ? {...i, updated} : i)`.

Istanbul treats both sides of the ternary as separate branches. If only one item is in the array, the `:i` (pass-through) branch is never executed.

**Why:** With a single-item array, every element matches the condition, so the else arm is dead code during the test.

**How to apply:** Always add at least 2 different items before testing `addItem` (duplicate) or `updateQuantity`, so one item is the target and another passes through unchanged:
```typescript
await act(async () => {
  result.current.addItem({ id: 1, ... });
  result.current.addItem({ id: 2, ... }); // ensures else branch is hit
});
await act(async () => {
  result.current.addItem({ id: 1, ... }); // only id:1 increments, id:2 stays
});
```
