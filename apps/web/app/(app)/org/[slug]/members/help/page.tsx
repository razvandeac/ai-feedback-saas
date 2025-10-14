export default function MembersHelpPage() {
  return (
    <div className="max-w-3xl mx-auto prose prose-sm">
      <h1>👥 Member & Invite Help</h1>
      <p>This page explains how to manage team members in your organization.</p>

      <hr />

      <h2>🔑 Roles</h2>
      <table>
        <thead>
          <tr>
            <th>Role</th>
            <th>Permissions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Owner</strong></td>
            <td>Full control (settings, members, projects).</td>
          </tr>
          <tr>
            <td><strong>Admin</strong></td>
            <td>Manage members and org settings.</td>
          </tr>
          <tr>
            <td><strong>Member</strong></td>
            <td>Access and work within projects.</td>
          </tr>
        </tbody>
      </table>

      <hr />

      <h2>✉️ Inviting Members</h2>
      <ol>
        <li>Go to <strong>Members → Invite Member</strong>.</li>
        <li>Enter the user&apos;s email and select their role.</li>
        <li>Click <strong>Send Invite</strong>.</li>
      </ol>
      <p>
        After sending, a toast appears with <strong>Copy Accept Link</strong> — use it to manually 
        share the invite link if emails aren&apos;t delivered (e.g., in dev).
      </p>
      <blockquote>
        <p>💡 You can also copy the link anytime from the <strong>Invites</strong> table.</p>
      </blockquote>

      <hr />

      <h2>🔗 Accepting Invites</h2>
      <ul>
        <li>The invited user logs in using the <strong>same email</strong> as the invite.</li>
        <li>Opening the invite link (from email or &quot;Copy Accept Link&quot;) activates their membership.</li>
        <li>If the emails don&apos;t match, the invite is rejected for security.</li>
      </ul>

      <hr />

      <h2>🗑 Removing Members</h2>
      <p>
        Admins can remove members from the <strong>Members</strong> table.<br />
        Removed users immediately lose access to projects and data.
      </p>

      <hr />

      <h2>⚙️ Email Delivery Notes</h2>
      <ul>
        <li>In production, invites are emailed automatically via <strong>Resend</strong>.</li>
        <li>In development, only the sandbox email (your own) receives messages — use <strong>Copy Accept Link</strong> to onboard others.</li>
      </ul>

      <hr />

      <h2>🧩 Tips</h2>
      <ul>
        <li>Share invite links privately; they include a secure token.</li>
        <li>Use unique emails for testing multiple roles.</li>
        <li>Keep at least one owner in every organization.</li>
      </ul>

      <hr />

      <p className="text-sm text-neutral-500">
        <em>This guide covers organization-level management.<br />
        For platform feedback, visit <code>/admin</code> (Vamoot internal only).</em>
      </p>
    </div>
  );
}

