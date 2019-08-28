# 🖥️ Speakup Staart

[![Dependencies](https://img.shields.io/david/o15y/staart.svg)](https://david-dm.org/o15y/staart)
[![Dev dependencies](https://img.shields.io/david/dev/o15y/staart.svg)](https://david-dm.org/o15y/staart)
![Type definitions](https://img.shields.io/badge/types-TypeScript-blue.svg)

This repository contains the code for Speakup's upcoming developer platform's backend written in Node.js\/TypeScript. It's frontend is available at [speakupnl/staart-ui](https://github.com/speakup/staart-ui).

This project is based on [Staart](https://github.com/o15y/staart).

**⚠️ WARNING:** This repository is currently in development and will contain breaking changes. Do not use it in production.

## 🛠 Endpoints

The base URL for these endpoints is `https://speakup-staart.caprover.oswaldlabs.com/v1/`

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

## 📄 License

For now, this project is not available under an open-source license.
