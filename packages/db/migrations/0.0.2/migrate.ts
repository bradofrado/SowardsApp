import { User, UserVacation } from "../../lib/generated/client";
import { MigrationScript } from "../run-migration";

const runMigration: MigrationScript = async (db) => {
    const userCollection = db.collection<User>('User');
    const updateResult = await userCollection.updateMany(
        { amountType: { $exists: false } }, // Condition to add links only if it does not already exist
        { $set: { amountType: 'adult' } } // Add links field with an empty array
    );

    interface UserVacationOld {
        userId: string
    }
    const userVacationCollection = db.collection<UserVacationOld>('UserVacation');
    const userVacations = await userVacationCollection.find({}).toArray();
    for (const userVacation of userVacations) {
        const result = await userCollection.updateOne(
            { id: {$eq: userVacation.userId} },
            { $set: { userVacationId: userVacation._id.toString() }}
        );
    }

    const userVacationResult = await userVacationCollection.updateMany(
        {name: { $exists: false } },
        {$set : {name: 'New Family'}}
    )

    return `Updated ${updateResult.modifiedCount} documents to add the amountType field`
}

export default runMigration