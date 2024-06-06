import { clerkClient } from "@clerk/nextjs";
import { Prisma, prisma } from "db/lib/prisma";
import type {AuthContext, Session, User} from 'model/src/auth';
import { getUserVacation } from "./repositories/user-vacation";

const payload = {
	include: {
		userVacation: true
	}
} satisfies Prisma.UserDefaultArgs 

const prismaToUser = (user: Prisma.UserGetPayload<typeof payload>): User => {
	return {
		id: user.id,
		firstname: user.firstname,
		lastname: user.lastname,
		roles: user.roles,
		email: user.email,
		userVacationId: user.userVacation?.id
	}
}
export const getAccount = async (userId: string): Promise<User | undefined> => {
	const account = await prisma.user.findFirst({
		where: {
			userId
		},
		...payload
	});

	if (account === null) return undefined;

	return prismaToUser(account);
}

export const getUsers = async (): Promise<User[]> => {
	const users = await prisma.user.findMany(payload);

	return users.map(user => prismaToUser(user))
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
		},
		...payload
	});

	return prismaToUser(newUser)
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
			account = await createAccount({firstname: user.firstName || '', lastname: user.lastName || '', email, userVacationId: ''}, user.id);
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
