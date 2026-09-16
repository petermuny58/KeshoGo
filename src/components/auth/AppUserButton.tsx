import { UserButton } from '@clerk/clerk-react';

/** Shared UserButton — KeshoGo uses Store records, not Clerk Organizations. */
const appearance = {
  elements: {
    avatarBox: 'h-9 w-9 ring-2 ring-white/20',
    // Hide org actions so Clerk doesn't hammer organization_creation_defaults
    organizationSwitcherTrigger: { display: 'none' },
    userButtonPopoverActionButton__createOrganization: { display: 'none' },
    userButtonPopoverActionButton__manageOrganization: { display: 'none' },
  },
};

type Props = {
  afterSignOutUrl?: string;
  className?: string;
};

export function AppUserButton({ afterSignOutUrl = '/', className }: Props) {
  return (
    <div className={className}>
      <UserButton afterSignOutUrl={afterSignOutUrl} appearance={appearance} />
    </div>
  );
}
