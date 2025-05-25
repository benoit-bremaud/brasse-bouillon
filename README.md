# Brasse-Bouillon

[![Build](https://img.shields.io/github/actions/workflow/status/benoit-bremaud/brasse-bouillon/ci.yml?branch=main)](https://github.com/benoit-bremaud/brasse-bouillon/actions)
[![License](https://img.shields.io/github/license/benoit-bremaud/brasse-bouillon)](LICENSE)
[![Issues](https://img.shields.io/github/issues/benoit-bremaud/brasse-bouillon)](https://github.com/benoit-bremaud/brasse-bouillon/issues)
[![Last Commit](https://img.shields.io/github/last-commit/benoit-bremaud/brasse-bouillon)](https://github.com/benoit-bremaud/brasse-bouillon/commits/main)
[![Docker](https://img.shields.io/badge/docker-enabled-blue?logo=docker)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green?logo=node.js)](https://nodejs.org/)
[![Platform](https://img.shields.io/badge/platform-local--dev-lightgrey)](https://github.com/benoit-bremaud/brasse-bouillon)

**Brasse-Bouillon** is an open-source mobile and web application designed to support amateur brewers in managing and sharing their brewing recipes. It provides essential tools to calculate brewing parameters and organize batches efficiently.

---

## Table of Contents

* [Project Overview](#project-overview)
* [Installation](#installation)
* [Usage](#usage)
* [Contributing](#contributing)
* [Documentation](#documentation)
* [Project Status](#project-status)
* [Website](#website)
* [Contact](#contact)
* [License](#license)

---

## Project Overview

This project follows an Agile methodology and is structured into modular GitHub Projects (Frontend, Backend, Design System, etc.).

**Main Features:**

* Recipe creation and editing
* Brewing parameter calculations (ABV, IBU, OG/FG)
* Session tracking
* User-friendly mobile experience

---

## Installation

To install and run the project locally:

```bash
# Clone the repository
git clone https://github.com/benoit-bremaud/brasse-bouillon.git
cd brasse-bouillon

# Backend setup
cd api
cp .env.example .env
npm install

# Frontend setup
cd ../mobile
npm install
npx expo start
```

---

## Usage

Once installed, you can:

* Access the frontend via Expo to simulate the mobile interface
* Interact with the backend via REST endpoints
* Add or manage recipes
* View calculated data for each batch

---

## Contributing

Contributions are welcome! Please follow the project's conventions:

* Follow our [CONVENTIONS.md](./CONVENTIONS.md) file.
* Use [Angular-style commit messages](https://www.conventionalcommits.org/en/v1.0.0/): `type(scope): short description`
* Reference issues using `Closes #<issue-number>`.
* Create PRs with clear checklists and descriptions.
* See also: [`CONTRIBUTING.md`](./CONTRIBUTING.md)

---

## Documentation

Project documentation is stored in the `docs/` folder and dedicated subproject READMEs.

Notable files:

* [`frontend/README.md`](./frontend/README.md) – Guide for launching and developing the mobile app

* [`backend/README.md`](./backend/README.md) – Technical guide for backend setup and usage

* [`docs/design/charte_graphique.md`](./docs/design/charte_graphique.md)

* [`docs/backend/api-overview.md`](./docs/backend/api-overview.md)

* [`docs/frontend/navigation-structure.md`](./docs/frontend/navigation-structure.md)

---

## Project Status

| Phase                        | Status         |
| ---------------------------- | -------------- |
| Phase 1 – Initialisation     | ✅ Completed    |
| Phase 2 – Conception         | ✅ Completed    |
| Phase 3 – Development        | 🚧 In Progress |
| Phase 4 – Testing & QA       | 📝 Planned     |
| Phase 5 – Deployment         | ⏳ Upcoming     |
| Phase 6 – Final Presentation | ⏳ Upcoming     |

---

## Website

Visit the official website: [https://brasse-bouillon.com](https://brasse-bouillon.com)

---

## Contact

Project maintained by [@benoit-bremaud](https://github.com/benoit-bremaud). For any inquiries, open an issue or contact via GitHub.

---

## License

Distributed under the MIT License. See the `LICENSE` file for more details.
