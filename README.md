# 🖥️ Speakup Staart

[![Dependencies](https://img.shields.io/david/o15y/staart.svg)](https://david-dm.org/o15y/staart)
[![Dev dependencies](https://img.shields.io/david/dev/o15y/staart.svg)](https://david-dm.org/o15y/staart)
![Type definitions](https://img.shields.io/badge/types-TypeScript-blue.svg)

This repository contains the code for Speakup's upcoming developer platform's backend written in Node.js\/TypeScript. It's frontend is available at [speakupnl/staart-ui](https://github.com/speakupnl/staart-ui).

This project is based on [Staart](https://github.com/o15y/staart). Instead of Staart's authentication and API management tools, it uses KeyCloak and an API gateway managed by Speakup.

**⚠️ WARNING:** This repository is currently in development and will contain breaking changes. Do not use it in production.

## 🛠 Endpoints

The base URL for these endpoints is `https://speakup-staart.caprover.oswaldlabs.com/v1/` while in development. When ready, this base URL will be moved.

### Users

| Endpoint | Method |
| - | - |
| `GET /users` | List of all users (admin only) |
| `GET /users/:id` | Get a user's details |
| `PATCH /users/:id` | Update a user's details |
| `DELETE /users/:id` | Delete a user |
| `POST /users/:id/password` | Change a user's password |
| `POST /users/:id/resend-verification` | Send email verification |
| `GET /users/:id/groups` | Get a user's group memberships |
| `DELETE /users/:id/groups/:groupId` | Remove a user from a group |

### Teams

| Endpoint | Method |
| - | - |
| `GET /groups` | List of all teams (admin only) |
| `GET /groups/:id` | Get a team's details |
| `PATCH /groups/:id` | Update a team's details |
| `DELETE /groups/:id` | Delete a team |
| `GET /groups/:id/members` | List a team's members |
| `PUT /groups/:id/members/:userId` | Add a user to a team |
| `DELETE /groups/:id/members/:userId` | Remove a user from a team |

## 📄 License

For now, this project is not available under an open-source license.
