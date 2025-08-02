# cpmm-roach


A cpmm bundler that bypasses the "open_time > block_time" constraint (which prevents bundling) with a timing attack.

As of now, the bare minimum is complete. Will provide remove liquidity function later.

## instructions


- create a token and have enough SOL in wallet (WSOL conversion is automatic)
- put your token address in index.ts line 23 (tokenA variable)
- rename .env.example to .env
- put your uint8 array encoded private key to auth.json
- type yarn start

for questions add me on telegram @atillaweb3 (free support if it's not too much work)
