default:
    @just --list

dev:
    pnpm dev

build:
    pnpm build

fmt:
    pnpm prettier .

fmt-fix:
    pnpm prettier --write .

lint:
    pnpm eslint

lint-fix:
    pnpm eslint . --fix

clean:
    rm -rf .next node_modules
    pnpm install

pre-push: fmt-fix lint-fix