'use client'
import { SignedOut, SignedIn, SignInButton, UserButton } from '@clerk/nextjs';
import { usePathname} from 'next/navigation';
import type { NavItem} from 'ui/src/components/core/navbar';
import {Navbar} from 'ui/src/components/core/navbar';

export const Nav = () => {
    const pathname = usePathname();
    const items: NavItem[] = [
        {
            label: 'Plan',
            href: '/plan',
            selected: pathname.includes('plan'),
        },
        {
            label: 'Group',
            href: '/group',
            selected: pathname.includes('group')
        }
    ]
    return (
        <Navbar items={items} profileItem={<>
        <SignedIn><UserButton/></SignedIn>
        <SignedOut><SignInButton mode='modal'/></SignedOut>
        </>}/>
    )
}