# 🧭 Vamoot Admin User Guide

This guide describes the administrative features available to **organization owners and admins** in Vamoot.  
It covers user management, invites, permissions, and the "Copy Accept Link" flow used during onboarding.

---

## 🏢 1. Organization Management

Admins and owners can:
- Create and edit **organizations**.
- Manage **members** (invite, remove, assign roles).
- View all **projects** under the organization.
- Access **feedback** and **analytics** dashboards.

---

## 👥 2. Member Roles

| Role | Description | Permissions |
|------|--------------|-------------|
| **Owner** | Created the org. Full control over members, projects, billing. | All actions |
| **Admin** | Manages members and settings. | All except deletion of owner |
| **Member** | Contributes within projects. | View/create project data only |

---

## ✉️ 3. Inviting New Members

### Steps
1. Go to your **Organization → Members** tab.
2. Click **Invite Member**.
3. Enter the user's **email address** and choose a role.
4. Press **Send Invite**.

A success toast confirms the invite was created and includes a **Copy Accept Link** button.

---

### 🔗 Copy Accept Link

In development (or if email delivery is disabled), admins can use the **Copy Accept Link** to manually share the invite link.

- Click **Copy Accept Link** in the success toast after creating an invite.  
  → The unique acceptance URL is copied to clipboard.
- Send this URL to the invited user directly (chat, Slack, etc.).
- When the invited user opens the link while logged in, their membership is activated.

You can also copy the link anytime later:
1. Open the **Invites** table.
2. Click **Copy Accept Link** next to any pending invite.

---

### ⚙️ Email Delivery

- In production, invites are automatically sent via **Resend** to the invitee's email.
- In local/dev environments, emails go only to the sandbox account (admin's own email).  
  → Use **Copy Accept Link** for all other test accounts.

---

## 🧩 4. Accepting an Invite

The invited user must:
1. Log in with the same email used in the invite.
2. Open the **accept invite link** (either from the email or copied link).
3. Once matched, the user joins the organization automatically.

If emails mismatch, the system will show **"Email mismatch"** for security.

---

## 🛠️ 5. Removing Members

Admins can:
- Remove a member by clicking **Remove** in the Members table.
- The user immediately loses access to org projects.

---

## 🪪 6. Admin Access Summary

| Action | Who Can Perform | Location |
|---------|------------------|-----------|
| Invite users | Owner / Admin | Org → Members |
| Copy accept link | Owner / Admin | Org → Members or Invite toast |
| Change roles | Owner / Admin | Org → Members |
| Remove members | Owner / Admin | Org → Members |
| View feedback dashboard | Owner / Admin | Org → Feedback |
| Access platform admin page | Platform Admins only | `/admin` |

---

## 🧩 7. Platform Admins (Vamoot Internal)

Separate from organization admins, **platform admins** are internal users listed in `platform_admins`.  
They can:
- View and triage **platform-level feedback** via `/admin`.
- Update feedback status (new → triaged → closed).

---

## ✅ Tips

- Always verify invites before sharing links externally.
- In dev, use `INVITES_DEV_RELAX=true` if you want to skip email match checks (local only).
- Copy links only from trusted sessions; they contain unique tokens.

---

_Last updated: October 14, 2025_

