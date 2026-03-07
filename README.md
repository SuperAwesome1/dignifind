# DigniFind Monorepo

A monorepo containing all DigniFind applications, managed with **npm workspaces**.

## Packages

| Package | Description | Stack |
|---|---|---|
| [`dignifind-admin`](./dignifind-admin) | Admin portal for funeral management | Angular 21 |
| [`dignifind-frontend`](./dignifind-frontend) | Public-facing user portal | Angular 21 |
| [`dignifind-legacy`](./dignifind-legacy) | Original static HTML admin site | Vanilla HTML/JS/CSS |

## Getting Started

```bash
# Install all dependencies
npm install

# Run the admin portal
npm run admin

# Run the frontend portal
npm run frontend
```

## Structure

```
dignifind/
├── package.json          # Root — npm workspaces
├── dignifind-admin/      # Angular admin app
├── dignifind-frontend/   # Angular public frontend
└── dignifind-legacy/     # Legacy static site
```
