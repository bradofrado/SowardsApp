import { clerkClient } from "@clerk/nextjs";
import { Prisma, prisma } from "db/lib/prisma";
import type {AuthContext, Session, User} from 'model/src/auth';
import { amountTypesSchema } from 'model/src/vacation';

import { payload as userVacationPayload, prismaToUserVacation } from "./repositories/user-vacation";

const payload = {
	include: {
		userVacation: userVacationPayload
	}
} satisfies Prisma.UserDefaultArgs 

const prismaToUser = (user: Prisma.UserGetPayload<typeof payload>): User => {
	return {
		id: user.id,
		firstname: user.firstname,
		lastname: user.lastname,
		roles: user.roles,
		email: user.email,
		userVacationId: user.userVacation?.id,
		amountType: amountTypesSchema.parse(user.amountType),
		userVacation: user.userVacation ? prismaToUserVacation(user.userVacation) : undefined
	}
}
export const getAccount= async (id: string): Promise<User | undefined> => {
	const account = await prisma.user.findFirst({
		where: {
			id
		},
		...payload
	});

	if (account === null) return undefined;

	return prismaToUser(account);
}

export const getAccountByClerkId = async (userId: string): Promise<User | undefined> => {
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
			amountType: 'adult',
			roles: ['user'],
		},
		...payload
	});

	return prismaToUser(newUser)
}

export const connectAccountToUserVacation = async (accountId: string, userVacationId: string): Promise<void> => {
	await prisma.user.update({
		where: {
			id: accountId
		},
		data: {
			userVacation: {
				connect: {
					id: userVacationId
				}
			}
		}
	});
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
		let account = await getAccountByClerkId(user.id);
		if (!account) {
			account = await createAccount({firstname: user.firstName || '', lastname: user.lastName || '', email, userVacationId: '', amountType: 'adult'}, user.id);
		}
		const vacationAccount = account.userVacation
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
