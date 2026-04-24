@AGENTS.md

# Related repositories

## filecoin-porep-market-tooling (`/home/rafal/Projects/filecoin-porep-market-tooling`)
Python CLI that this UI mirrors. When implementing or verifying any client/SP action, check the equivalent CLI command first.

Key paths:
- `cli/commands/client/` — all client commands (init_accepted_deals, make_allocation, deposit_for_all_deals, propose_deal_from_manifest)
- `cli/commands/sp/` — all SP commands (accept_deal, onboard_data, match_client_allocation_with_cid)
- `cli/services/contracts/abi/` — canonical ABIs for all contracts (FileCoinPay, Validator, ValidatorFactory, USDC, PoRepMarket, etc.)
- `cli/commands/client/_utils.py` — EIP-712 permit signing logic and deposit amount calculation
- `cli/services/contracts/filecoin_pay.py` — FileCoinPay contract interface
- `cli/services/contracts/filecoinpay_validator.py` — Validator contract interface
- `cli/services/contracts/validator_factory.py` — ValidatorFactory contract interface

## filecoin-boost (`/home/rafal/Projects/filecoin-boost`)
Contains porep-market integration scripts.

Key paths:
- `scripts/porep-market/` — SP-side deal scripts
- `scripts/porep-market-tooling/` — tooling scripts

# Build commands
- `pnpm build` — production build (Next.js)
- `pnpm dev` — local dev server
- `npx tsc --noEmit` — type check only
