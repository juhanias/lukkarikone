<div align="center">
    <br/>
    <p>
        <img src="public/icon.svg"
            title="Open Lukkarikone" alt="Open Lukkarikone logo" width="100" />
        <h1>Open Lukkarikone</h1>
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

## Development
This is a pretty barebones React Router based project bootstrapped with Vite.

Both the frontend and backend are contained in the same repository. Both utilize Bun and Typescript.

Pull requests welcome. Preferably, issues should be created first to discuss larger changes.

At the present moment, in production, the frontend builds are being served through a Cloudflare Pages instance, while the backend API is hosted separately. This is subject (and likely) to change in the future.

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