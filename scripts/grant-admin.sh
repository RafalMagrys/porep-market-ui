#!/usr/bin/env bash
# Grant admin + operator roles on PoRepMarket and SPRegistry to a new address,
# and optionally fund it with FIL on the devnet.
#
# Usage:
#   ADMIN_KEY=0x<deployer-private-key> \
#   TARGET_ADDRESS=0x<address-to-grant> \
#   ./scripts/grant-admin.sh
#
# Optional overrides (defaults to devnet values from .env.local):
#   RPC_URL            — RPC endpoint (default: http://localhost:1234/rpc/v1)
#   POREP_MARKET       — PoRepMarket contract address
#   SP_REGISTRY        — SPRegistry contract address
#   FUND_AMOUNT        — FIL to send, e.g. "10ether" (skip funding if unset)
set -euo pipefail

# ── load .env.local if present ────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env.local"
if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC2046
  export $(grep -v '^#' "$ENV_FILE" | grep -v '^$' | xargs)
fi

# ── required inputs ───────────────────────────────────────────────────────────
ADMIN_KEY="${ADMIN_KEY:?'Set ADMIN_KEY to the deployer/current-admin private key (0x…)'}"
TARGET_ADDRESS="${TARGET_ADDRESS:?'Set TARGET_ADDRESS to the 0x address that should become admin'}"

# ── defaults ──────────────────────────────────────────────────────────────────
RPC_URL="${RPC_URL:-http://localhost:1234/rpc/v1}"
POREP_MARKET="${POREP_MARKET:-${NEXT_PUBLIC_DEVNET_POREP_MARKET:-}}"
SP_REGISTRY="${SP_REGISTRY:-${NEXT_PUBLIC_DEVNET_SP_REGISTRY:-}}"

if [[ -z "$POREP_MARKET" || "$POREP_MARKET" == "0x0000000000000000000000000000000000000000" ]]; then
  echo "ERROR: POREP_MARKET address not set. Pass it via env or check .env.local" >&2
  exit 1
fi
if [[ -z "$SP_REGISTRY" || "$SP_REGISTRY" == "0x0000000000000000000000000000000000000000" ]]; then
  echo "ERROR: SP_REGISTRY address not set. Pass it via env or check .env.local" >&2
  exit 1
fi

# OpenZeppelin DEFAULT_ADMIN_ROLE is bytes32(0)
DEFAULT_ADMIN_ROLE="0x0000000000000000000000000000000000000000000000000000000000000000"
# OPERATOR_ROLE = keccak256("OPERATOR_ROLE")
OPERATOR_ROLE=$(cast keccak "OPERATOR_ROLE" --rpc-url "$RPC_URL" 2>/dev/null || \
  echo "0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929")

CAST_FLAGS=(--rpc-url "$RPC_URL" --private-key "$ADMIN_KEY")

echo "RPC:            $RPC_URL"
echo "PoRepMarket:    $POREP_MARKET"
echo "SPRegistry:     $SP_REGISTRY"
echo "Target:         $TARGET_ADDRESS"
echo ""

# ── optional: fund the address ────────────────────────────────────────────────
if [[ -n "${FUND_AMOUNT:-}" ]]; then
  echo "Sending $FUND_AMOUNT FIL to $TARGET_ADDRESS …"
  cast send "${CAST_FLAGS[@]}" \
    --value "$FUND_AMOUNT" \
    "$TARGET_ADDRESS"
  echo "Funded."
  echo ""
fi

# ── grant DEFAULT_ADMIN_ROLE on SPRegistry ────────────────────────────────────
echo "Granting DEFAULT_ADMIN_ROLE on SPRegistry …"
cast send "${CAST_FLAGS[@]}" \
  "$SP_REGISTRY" \
  "grantRole(bytes32,address)" \
  "$DEFAULT_ADMIN_ROLE" \
  "$TARGET_ADDRESS"

# ── grant OPERATOR_ROLE on SPRegistry ────────────────────────────────────────
echo "Granting OPERATOR_ROLE on SPRegistry …"
cast send "${CAST_FLAGS[@]}" \
  "$SP_REGISTRY" \
  "grantRole(bytes32,address)" \
  "$OPERATOR_ROLE" \
  "$TARGET_ADDRESS"

# ── grant DEFAULT_ADMIN_ROLE on PoRepMarket ───────────────────────────────────
echo "Granting DEFAULT_ADMIN_ROLE on PoRepMarket …"
cast send "${CAST_FLAGS[@]}" \
  "$POREP_MARKET" \
  "grantRole(bytes32,address)" \
  "$DEFAULT_ADMIN_ROLE" \
  "$TARGET_ADDRESS"

# ── verify ────────────────────────────────────────────────────────────────────
echo ""
echo "Verifying …"
IS_ADMIN_REG=$(cast call --rpc-url "$RPC_URL" \
  "$SP_REGISTRY" "hasRole(bytes32,address)(bool)" "$DEFAULT_ADMIN_ROLE" "$TARGET_ADDRESS")
IS_OP_REG=$(cast call --rpc-url "$RPC_URL" \
  "$SP_REGISTRY" "hasRole(bytes32,address)(bool)" "$OPERATOR_ROLE" "$TARGET_ADDRESS")
IS_ADMIN_MKT=$(cast call --rpc-url "$RPC_URL" \
  "$POREP_MARKET" "hasRole(bytes32,address)(bool)" "$DEFAULT_ADMIN_ROLE" "$TARGET_ADDRESS")

echo "SPRegistry  DEFAULT_ADMIN_ROLE : $IS_ADMIN_REG"
echo "SPRegistry  OPERATOR_ROLE      : $IS_OP_REG"
echo "PoRepMarket DEFAULT_ADMIN_ROLE : $IS_ADMIN_MKT"
