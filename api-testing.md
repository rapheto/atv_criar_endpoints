# API Testing Guide — Bolão

## 1. GET /api/matches

List matches with optional filters.

**Query params:**

| Parâmetro | Tipo   | Descrição                                      |
|-----------|--------|------------------------------------------------|
| `stage`   | string | `GRUPOS`, `OITAVAS`, `QUARTAS`, `SEMI`, `FINAL` |
| `status`  | string | `SCHEDULED`, `LIVE`, `FINISHED`                |

**Responses:**

| Código  | Situação             |
|---------|----------------------|
| `200 OK` | Array de `Match`   |

### Curls

```bash
# ✅ 200 — all matches
curl -i "http://localhost:3001/api/matches"

# ✅ 200 — filter by stage
curl -i "http://localhost:3001/api/matches?stage=GRUPOS"

# ✅ 200 — filter by status
curl -i "http://localhost:3001/api/matches?status=SCHEDULED"

# ✅ 200 — filter by stage + status
curl -i "http://localhost:3001/api/matches?stage=GRUPOS&status=SCHEDULED"

# ✅ 200 — other stages
curl -i "http://localhost:3001/api/matches?stage=OITAVAS"
curl -i "http://localhost:3001/api/matches?stage=FINAL"

# ✅ 200 — live matches
curl -i "http://localhost:3001/api/matches?status=LIVE"

# ✅ 200 — finished matches
curl -i "http://localhost:3001/api/matches?status=FINISHED"
```

---

## 2. POST /api/guesses

Create a new guess.

**Body JSON:**

```json
{
  "poolId": 1,
  "participantId": 1,
  "matchId": 2,
  "homeScore": 2,
  "awayScore": 1
}
```

**Responses:**

| Código            | Situação                                                    |
|-------------------|-------------------------------------------------------------|
| `201 Created`     | Palpite criado com sucesso                                  |
| `400 Bad Request` | Campos obrigatórios ausentes                                |
| `404 Not Found`   | Partida ou participante não existe                          |
| `409 Conflict`    | Participante já fez palpite nessa partida / partida já começou |

### Curls

```bash
# ✅ 201 — success
curl -i -X POST http://localhost:3001/api/guesses \
  -H "Content-Type: application/json" \
  -d '{"poolId":1,"participantId":1,"matchId":2,"homeScore":2,"awayScore":1}'

# ❌ 400 — missing homeScore and awayScore (use a combo with no existing guess)
curl -i -X POST http://localhost:3001/api/guesses \
  -H "Content-Type: application/json" \
  -d '{"poolId":1,"participantId":2,"matchId":2}'

# ❌ 400 — negative score
curl -i -X POST http://localhost:3001/api/guesses \
  -H "Content-Type: application/json" \
  -d '{"poolId":1,"participantId":2,"matchId":2,"homeScore":-1,"awayScore":0}'

# ❌ 404 — match not found
curl -i -X POST http://localhost:3001/api/guesses \
  -H "Content-Type: application/json" \
  -d '{"poolId":1,"participantId":1,"matchId":9999,"homeScore":2,"awayScore":1}'

# ❌ 404 — participant not in pool
curl -i -X POST http://localhost:3001/api/guesses \
  -H "Content-Type: application/json" \
  -d '{"poolId":1,"participantId":9999,"matchId":2,"homeScore":2,"awayScore":1}'

# ❌ 409 — duplicate guess (run the 201 curl twice)
curl -i -X POST http://localhost:3001/api/guesses \
  -H "Content-Type: application/json" \
  -d '{"poolId":1,"participantId":1,"matchId":2,"homeScore":2,"awayScore":1}'

# ❌ 409 — match already started (requires matchId with kickoffAt in the past)
# First, set a match to the past:
# docker exec -it atv_criar_endpoints-db-1 psql -U postgres -d bolao_db \
#   -c "UPDATE matches SET \"kickoffAt\" = '2020-01-01' WHERE id = 1;"
curl -i -X POST http://localhost:3001/api/guesses \
  -H "Content-Type: application/json" \
  -d '{"poolId":1,"participantId":2,"matchId":1,"homeScore":0,"awayScore":0}'
```

---

## 3. PATCH /api/guesses/:id

Edit an existing guess.

**Body JSON:**

```json
{ "homeScore": 3, "awayScore": 0 }
```

**Responses:**

| Código            | Situação                            |
|-------------------|-------------------------------------|
| `200 OK`          | Palpite atualizado                  |
| `400 Bad Request` | Tentativa de editar pós-kickoff     |
| `404 Not Found`   | Palpite não existe                  |

### Curls

```bash
# ✅ 200 — success (use an existing guess id, e.g. 3)
curl -i -X PATCH http://localhost:3001/api/guesses/3 \
  -H "Content-Type: application/json" \
  -d '{"homeScore":3,"awayScore":0}'

# ✅ 200 — update only homeScore
curl -i -X PATCH http://localhost:3001/api/guesses/3 \
  -H "Content-Type: application/json" \
  -d '{"homeScore":1}'

# ❌ 404 — guess not found
curl -i -X PATCH http://localhost:3001/api/guesses/9999 \
  -H "Content-Type: application/json" \
  -d '{"homeScore":3,"awayScore":0}'

# ❌ 400 — match already started (guess id 4 is linked to matchId 1 set to the past)
# First, set a match to the past:
# docker exec -it atv_criar_endpoints-db-1 psql -U postgres -d bolao_db \
#   -c "UPDATE matches SET \"kickoffAt\" = '2020-01-01' WHERE id = 1;"
curl -i -X PATCH http://localhost:3001/api/guesses/4 \
  -H "Content-Type: application/json" \
  -d '{"homeScore":3,"awayScore":0}'
```

---

## 4. DELETE /api/pools/:poolId/participants/:participantId

Remove a participant from a pool.

**Responses:**

| Código           | Situação                          |
|------------------|-----------------------------------|
| `204 No Content` | Removido com sucesso              |
| `404 Not Found`  | Bolão ou participante não existe  |

### Curls

```bash
# ✅ 204 — success
curl -i -X DELETE http://localhost:3001/api/pools/1/participants/2

# ❌ 404 — pool not found
curl -i -X DELETE http://localhost:3001/api/pools/9999/participants/2

# ❌ 404 — participant not in pool
curl -i -X DELETE http://localhost:3001/api/pools/1/participants/9999
```

---

## 5. GET /api/pools/:poolId/ranking

Return the pool ranking: participants grouped with their total points, sorted by `totalPoints` descending.

**Responses:**

| Código          | Situação                                                         |
|-----------------|------------------------------------------------------------------|
| `200 OK`        | Array de `{ participantId, name, email, totalPoints }` (desc)    |
| `404 Not Found` | Bolão não existe                                                 |

### Curls

```bash
# ✅ 200 — ranking of pool 1
curl -i http://localhost:3001/api/pools/1/ranking

# ❌ 404 — pool not found
curl -i http://localhost:3001/api/pools/9999/ranking
```

---

## Validate all endpoints

Run this script to hit every endpoint and print the resulting HTTP status. Start the API first (`npm run dev`) and seed the DB (`npm run db:seed`).

```bash
#!/usr/bin/env bash
B=http://localhost:3001/api
H=(-H "Content-Type: application/json")
pass=0; fail=0
check() { # check <label> <expected> <actual>
  if [ "$2" = "$3" ]; then printf "  ✅ %-45s %s\n" "$1" "$3"; pass=$((pass+1));
  else printf "  ❌ %-45s expected %s got %s\n" "$1" "$2" "$3"; fail=$((fail+1)); fi
}
code() { curl -s -m8 -o /dev/null -w '%{http_code}' "$@"; }

echo "── 1. GET /matches ──"
check "200 all matches"          200 "$(code "$B/matches")"
check "200 filter stage=GRUPOS"  200 "$(code "$B/matches?stage=GRUPOS")"
check "200 filter status=SCHEDULED" 200 "$(code "$B/matches?status=SCHEDULED")"

echo "── 2. POST /guesses ──"
check "400 missing fields"  400 "$(code -X POST "$B/guesses" "${H[@]}" -d '{"poolId":1,"participantId":1,"matchId":2}')"
check "400 negative score"  400 "$(code -X POST "$B/guesses" "${H[@]}" -d '{"poolId":1,"participantId":1,"matchId":2,"homeScore":-1,"awayScore":0}')"
check "404 match not found" 404 "$(code -X POST "$B/guesses" "${H[@]}" -d '{"poolId":1,"participantId":1,"matchId":9999,"homeScore":1,"awayScore":0}')"
check "404 participant not in pool" 404 "$(code -X POST "$B/guesses" "${H[@]}" -d '{"poolId":1,"participantId":9999,"matchId":2,"homeScore":1,"awayScore":0}')"
check "409 duplicate guess"  409 "$(code -X POST "$B/guesses" "${H[@]}" -d '{"poolId":1,"participantId":1,"matchId":2,"homeScore":1,"awayScore":0}')"

echo "── 3. PATCH /guesses/:id ──"
check "200 edit guess id=3"  200 "$(code -X PATCH "$B/guesses/3" "${H[@]}" -d '{"homeScore":4,"awayScore":2}')"
check "404 guess not found"  404 "$(code -X PATCH "$B/guesses/9999" "${H[@]}" -d '{"homeScore":1,"awayScore":1}')"

echo "── 4. DELETE /pools/:poolId/participants/:participantId ──"
check "404 participant not found" 404 "$(code -X DELETE "$B/pools/1/participants/9999")"
check "404 pool not found"        404 "$(code -X DELETE "$B/pools/9999/participants/1")"

echo "── 5. GET /pools/:poolId/ranking ──"
check "200 ranking"        200 "$(code "$B/pools/1/ranking")"
check "404 pool not found" 404 "$(code "$B/pools/9999/ranking")"

echo
echo "Result: $pass passed, $fail failed"
[ "$fail" -eq 0 ]
```

> Notes:
> - The `201 Created` POST and `204 No Content` DELETE are **destructive/stateful** (create or remove rows), so they are not in the idempotent runner above — test them manually with the curls in sections 2 and 4 on a freshly seeded DB.
> - `409 match already started` (POST) and `400 edit after kickoff` (PATCH) require a match with `kickoffAt` in the past — see the Tips section.

---

## Tips

Add `-i` to any curl to see the HTTP status code in the response headers:

```bash
curl -i -X POST http://localhost:3001/api/guesses \
  -H "Content-Type: application/json" \
  -d '{"poolId":1,"participantId":1,"matchId":2,"homeScore":2,"awayScore":1}'
```

To force a match into the past for testing 400/409 errors:

```bash
docker exec -it atv_criar_endpoints-db-1 psql -U postgres -d bolao_db \
  -c "UPDATE matches SET \"kickoffAt\" = '2020-01-01' WHERE id = 1;"
```
