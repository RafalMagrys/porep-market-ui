#!/usr/bin/env bash
set -euo pipefail

REPO="fidlabs/porep-market"
BRANCH="main"
RAW_BASE="https://raw.githubusercontent.com/${REPO}/${BRANCH}/abis"

UI_DIR="$(cd "$(dirname "$0")/.." && pwd)/src/abis"
TOOLING_DIR="/home/rafal/Projects/filecoin-porep-market-tooling/cli/services/contracts/abi"

# Contracts available in fidlabs/porep-market (FileCoinPay and USDC are not — keep existing)
CONTRACTS=(
  Client
  PoRepMarket
  SLIOracle
  SLIScorer
  SPRegistry
  Validator
  ValidatorFactory
)

UI_NETWORKS=(devnet calibnet mainnet)

fetch() {
  local contract="$1"
  curl -fsSL "${RAW_BASE}/${contract}.json"
}

echo "Fetching ABIs from ${REPO}@${BRANCH}..."

for contract in "${CONTRACTS[@]}"; do
  echo -n "  ${contract}... "
  abi=$(fetch "$contract")

  # UI — write to every network dir
  for network in "${UI_NETWORKS[@]}"; do
    echo "$abi" > "${UI_DIR}/${network}/${contract}.json"
  done

  # Tooling — flat abi dir
  if [[ -d "$TOOLING_DIR" ]]; then
    echo "$abi" > "${TOOLING_DIR}/${contract}.json"
  fi

  echo "done"
done

echo "Done. FileCoinPay and USDC were not updated (not in upstream repo)."
