# WISH WORLD V8.8 — Living World (combined beta)

- Adds local motorbike purchase for 180 virtual Sao, animated model and movement; bicycles and motorbikes are now visible to other players via validated presence enum and shared model geometry. Not authoritative ownership validation; no cars, boats or passengers.
- Four private-home color themes (three purchasable at 25 Sao). Existing furniture retained. No jointly owned homes.
- Daily tour of four existing regional landmarks, 60 virtual Sao once all visited. Local transaction history for new purchases, contracts and NPC market trades; market rollback on save failure. Existing gifts and symbolic vows retained; no shared wedding event or player trading.
- Batch accepted-friend lookup in presence instead of per-peer lookup, presence/receiver indexes and vehicle cleanup. HTTP polling remains; no WebSocket or load benchmark. Preserve customized procedural avatar when optional sample GLB would hide it.
- 15 inline scripts parsed and 14 synthetic economy/tour checks passed. Python tests added but not executed. No actual mobile/3D or multiplayer integration tests. Free Render database remains ephemeral; export progress before deployment.
