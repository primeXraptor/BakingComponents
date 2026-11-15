# Reusable login and school registration

Adapted from the Kunchanada login page, `RegistrationForm`, `RegistrationField`,
`KunchanadaAuthHeader`, `useKunchanadaRegistration` and credentials success flow in
`primeXraptor/mmu-main` at `123804276c7ccc47a8afe1e94448a33dce0d3523`.
The proprietary attribution in NOTICE.md applies.

```tsx
import { LoginForm, RegistrationForm, AuthHeader } from 'baking-components/auth';
import 'baking-components/auth.css';
```

This dedicated entry uses structural CSS without the existing component library's
colors, hover colors, shadows, gradients or theme variables. It retains responsive
form widths, field spacing, labels, help text, native focus indicators and accessible
dialogs. The root library entry also exports the components.

## Login

```tsx
<LoginForm
  onLogin={async credentials => {
    const response = await fetch('/your-api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error('Unable to log in.');
  }}
  onSuccess={() => { window.location.assign('/your-dashboard'); }}
/>
```

`onLogin` receives `{ schoolCode, password }`. Resolve only after authentication
succeeds; reject with an Error to show a dismissible error dialog. Pending requests
disable submission; failures keep the inputs. Success clears the password and calls
`onSuccess`. Navigation is owned by the host.

## School registration

```tsx
<RegistrationForm
  onRegister={async input => {
    // input contains all school/coordinator/MIC fields, password,
    // and scl_logo / mu_logo as File objects. Upload/submit in your host.
    const body = new FormData();
    for (const [key, value] of Object.entries(input)) body.append(key, value);
    const response = await fetch('/your-api/register', { method: 'POST', body });
    if (!response.ok) throw new Error('Unable to register school.');
    return response.json(); // { schoolCode: string }
  }}
  loginHref="/your-login"
/>
```

All school/contact fields and both logos are required. The original checks remain:
image MIME types, maximum 2 MB per logo, minimum six-character passwords and matching
confirmation. Email format and required fields are validated before submission;
invalid fields receive linked error text and the first invalid input is focused.

The callback receives `SchoolRegistrationInput`: school name/address, coordinator
name/email/phone, MIC name/phone, two File objects and the password. Confirmation
is local validation data and is omitted. Rejected submissions keep values and files
for retry. Successful submissions reset fields/files and show a dialog containing
the returned school code and entered password. Closing the dialog clears those
credentials from component state. They are never written to browser storage or logs.

The user can explicitly copy credentials. `onLogin` on the registration form runs
after a successful clipboard copy; `loginHref` supplies an independent login link
that still works when clipboard access is unavailable. `onRegistered` receives the
returned `{ schoolCode }` and does not receive the password.

`status="locked"` or `status="unavailable"` replaces the form with an appropriate
message. The host supplies that status; there is no automatic network polling.

## Individual components

- `AuthHeader`: title, description, optional children and configurable account links
  (`{ id, label, href }[]`) with `activePage` for the current link.
- `RegistrationField`: text/email/tel/password/file/textarea field with help and error
  associations, `onValueChange` or `onFileChange`.
- `AuthErrorDialog`: accessible dismissible error dialog.
- `RegistrationSuccess`: credentials dialog with `credentials`, `onClose`, `onLogin`
  and optional `loginHref`.
- `CopyCredentialsLoginButton`: explicit copy action and optional login callback/link.
- `validateSchoolRegistration`, `validateLogoFile`, `emptyRegistration`: reusable
  validation/state helpers. `validateLogoFile` returns an error string or undefined.
- `authStyles`: CSS module classes for structural customization.

Provide an optional `header` React node to either form to compose your own branding,
account links or countdowns. `title` customizes the default header. No brand assets,
Next.js router, Supabase client, Cloudinary configuration, upload endpoints, or
production credentials are bundled. Video success effects and event-site hero
content are omitted. The separate society-email verification feature is not part of
these source login/registration forms.

The host must validate files, credentials, permissions and registration status on
its server. Client validation alone does not enforce those rules.

## Demo and validation

Run `npm run dev` and select **Open login and registration demo** in the component
gallery (`?auth`). The demo accepts login locally, returns a demo school code for
registration, and never creates accounts or uploads files. Use sample data only.

`npm run typecheck`, `npm test` and `npm run build` validate the library. Builds emit
`dist/auth.js`, `dist/auth.css` and declarations under `dist/auth/` alongside the
existing component and dashboard bundles.
