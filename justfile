default:
	@just --list

# Requires Node 22 (see .nvmrc) — activate it first with: nvm use / fnm use / volta
setup:
	corepack enable
	corepack prepare pnpm@latest --activate
	pnpm install

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
