Load the reference implementation from filecoin-porep-market-tooling to understand the correct contract interaction pattern for the task at hand.

Read the following files from `/home/rafal/Projects/filecoin-porep-market-tooling`:
1. `cli/commands/client/init_accepted_deals.py` — 3-step post-acceptance flow
2. `cli/commands/client/_utils.py` — EIP-712 permit signing, deposit calculation
3. `cli/services/contracts/filecoin_pay.py` — FileCoinPay interface
4. `cli/services/contracts/filecoinpay_validator.py` — Validator interface
5. `cli/services/contracts/validator_factory.py` — ValidatorFactory interface
6. `cli/services/contracts/abi/FileCoinPay.json` — FileCoinPay ABI
7. `cli/services/contracts/abi/Validator.json` — Validator ABI
8. `cli/services/contracts/abi/ValidatorFactory.json` — ValidatorFactory ABI

Then summarize what the reference implementation does and how the UI should mirror it for the current task.
