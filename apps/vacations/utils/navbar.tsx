import { SignedOut, SignedIn, SignInButton, UserButton } from '@clerk/nextjs';
import {Navbar} from 'ui/src/components/core/navbar';

export const Nav = () => {
    return (
        <Navbar profileItem={<>
        <SignedIn><UserButton/></SignedIn>
        <SignedOut><SignInButton mode='modal'/></SignedOut>
        </>}/>
    )
}