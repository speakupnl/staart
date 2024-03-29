# 🖥️ Speakup Staart

[![Dependencies](https://img.shields.io/david/o15y/staart.svg)](https://david-dm.org/o15y/staart)
[![Dev dependencies](https://img.shields.io/david/dev/o15y/staart.svg)](https://david-dm.org/o15y/staart)
![Type definitions](https://img.shields.io/badge/types-TypeScript-blue.svg)

This repository contains the code for Speakup's upcoming developer platform's backend written in Node.js\/TypeScript. It's frontend is available at [speakupnl/staart-ui](https://github.com/speakupnl/staart-ui).

This project is based on [Staart](https://github.com/o15y/staart). Instead of Staart's authentication and API management tools, it uses KeyCloak and an API gateway managed by Speakup.

**⚠️ WARNING:** This repository is currently in development and will contain breaking changes. Do not use it in production.

## 🛠 Endpoints

The base URL for these endpoints is `https://speakup-staart.caprover.oswaldlabs.com/v1/` while in development. When ready, this base URL will be moved.

### Auth

| Endpoint | Method |
| - | - |
| `POST /auth/register` | Create a new account |
| `POST /auth/verify-token` | Verify a JWT |
| `POST /auth/login` | Login to your account |
| `POST /auth/refresh` | Refresh your token |
| `POST /auth/reset-password/request` | Request a password reset link |
| `POST /auth/reset-password/recover` | Set a new password |

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

#### Billing

| Endpoint | Method |
| - | - |
| `GET /groups/:id/billing` | Get a team's customer info |
| `PATCH /groups/:id/billing` | Update customer info |
| `GET /groups/:id/invoices` | Get a list of invoices |
| `GET /groups/:id/invoices/:invoiceId` | Get a specific invoice |
| `GET /groups/:id/subscriptions` | Get a list of subscriptions |
| `GET /groups/:id/subscriptions/:subscriptionId` | Get a specific subscription |
| `PATCH /groups/:id/subscriptions/:subscriptionId` | Update a subscription |
| `PUT /groups/:id/subscriptions` | Create a new subscription |
| `GET /groups/:id/pricing` | Get a list of pricing plans |
| `GET /groups/:id/sources` | Get a list of payment methods |
| `GET /groups/:id/sources/:sourceId` | Get a specific payment method |
| `PUT /groups/:id/sources` | Create a new payment method |
| `DELETE /groups/:id/sources/:sourceId` | Delete a payment method |
| `PATCH /groups/:id/sources/:sourceId` | Update a payment method |

#### Applications

| Endpoint | Method |
| - | - |
| `GET /groups/:id/applications` | Get a list of applications |
| `PUT /groups/:id/applications` | Create a new application |
| `GET /groups/:id/applications/:applicationId` | Get a specific application |
| `DELETE /groups/:id/applications/:applicationId` | Delete an application |
| `PATCH /groups/:id/applications/:applicationId` | Update an application |
| `GET /groups/:id/applications/:applicationId/secret` | Get an application's client secret |
| `PUT /groups/:id/applications/:applicationId/secret` | Create a new client secret |
| `GET /groups/:id/applications/:applicationId/default-scopes` | Get a list of default scopes |
| `PUT /groups/:id/applications/:applicationId/default-scopes/:scopeId` | Add a new default scopes |
| `DELETE /groups/:id/applications/:applicationId/default-scopes/:scopeId` | Delete a default scopes |
| `GET /groups/:id/applications/:applicationId/optional-scopes` | Get a list of optional scopes |
| `PUT /groups/:id/applications/:applicationId/optional-scopes/:scopeId` | Add a new optional scopes |
| `DELETE /groups/:id/applications/:applicationId/optional-scopes/:scopeId` | Delete an optional scopes |

## 📄 License

For now, this project is not available under an open-source license.
