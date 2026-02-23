<div align="center">
    <br/>
    <p>
        <img src="apps/frontend/public/icon.svg"
            title="Open Lukkarikone" alt="Open Lukkarikone logo" width="100" />
        <h1>Open Lukkarikone Monorepository</h1>
    </p>
    <p width="120">
        An open-source alternative to the widely used Lukkarikone 4
        <br>
        Customizable, fast & lightweight
    </p>
    <a href="https://lukkari.juh.fi/">
        lukkari.juh.fi
    </a>
    <br/>
</div>
<br/>

> [!IMPORTANT]
> Currently only supports the Lukkarikone instance of Turku UAS.

## Development & Components
`juhanias/lukkarikone` is structured as a monorepo. It contains the relevant service components for Open Lukkarikone.

### `apps/frontend`
This is a pretty barebones React Router based project bootstrapped with Vite. Bun, TS, Tailwind, Zustand are the main technologies used.

At the present moment, in production, the frontend builds are being served through a Cloudflare Pages instance, while the backend API is hosted separately. This is subject (and likely) to change in the future.

### `apps/backend`
The backend is an Elysia server. The stack is Typescript & Bun, with Prisma ORM (todo). The backend is responsible for proxying & caching data, providing utility endpoints, enforcing business logic & handling user data (todo!).


### Prerequisites
- [Bun](https://bun.sh/)
- [Docker](https://www.docker.com/) *(for testing deployments)*

### Setup
```sh
bun setup
```

### Running Locally
```sh
bun dev
```