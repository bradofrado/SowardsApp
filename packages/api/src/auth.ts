import { clerkClient } from "@clerk/nextjs";
import { prisma } from "db/lib/prisma";
import type {AuthContext, Session, User} from 'model/src/auth';
import { getUserVacation } from "./repositories/user-vacation";

export const getAccount = async (userId: string): Promise<User | undefined> => {
	const account = await prisma.user.findFirst({
		where: {
			userId
		},
	});

	if (account === null) return undefined;

	return {
		id: account.id,
		firstname: account.firstname,
		lastname: account.lastname,
		roles: account.roles,
		email: account.email,
	}
}

export const createAccount = async ({lastname, firstname, email}: Omit<User, 'roles' | 'id'>, userId: string): Promise<User> => {
	const newUser = await prisma.user.create({
		data: {
			userId,
			username: '',
			password: '',
			firstname,
			lastname,
			email,
			roles: ['user']
		}
	});

	return {
		id: newUser.id,
		firstname: newUser.firstname,
		lastname: newUser.lastname,
		email: newUser.email,
		roles: newUser.roles
	}
}

export const getServerAuthSession = async (userId: string | null, mockUserId?: string): Promise<Session | undefined> => {
	//const {userId} = auth()// : {userId: null};
	//const {userId} = _auth;
	let ourAuth: AuthContext | null = null;
	const userIdToUse = mockUserId !== 'none' ? mockUserId || userId : null;

	if (userIdToUse) {
		const user = await clerkClient.users.getUser(userIdToUse);

		if (!user.emailAddresses[0].emailAddress) {
			throw new Error("User does not have an email address");
		}
		const email = user.emailAddresses[0].emailAddress;
		let account = await getAccount(user.id);
		if (!account) {
			account = await createAccount({firstname: user.firstName || '', lastname: user.lastName || '', email}, user.id);
		}
		const vacationAccount = await getUserVacation(account.id);
		ourAuth = {
			user: account,
			userId: userIdToUse,
			userVacation: vacationAccount
		}
	}

	return ourAuth ? {
		auth: ourAuth,
	} : undefined
}
