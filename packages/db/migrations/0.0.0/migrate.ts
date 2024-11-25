import { Prisma, VacationEvent } from "../../lib/generated/client";
import { MigrationScript } from "../run-migration";

const migrate: MigrationScript = async (db) => {
  // Fetch the collection you want to migrate
  const collection = db.collection<VacationEvent>("VacationEvent");

  const vacationEvents = await collection.find({}).toArray();

  for (const event of vacationEvents) {
    const amounts = event.amounts as Prisma.JsonArray;
    // Update each amount object to include the createdById field
    const updatedAmounts = amounts.map((amount) => ({
      ...(amount as Prisma.JsonObject),
      createdById: event.createdById.toString(), // Set createdById from the VacationEvent document
    }));

    // Update the document in the database
    await collection.updateOne(
      { _id: event._id },
      { $set: { amounts: updatedAmounts } },
    );
  }

  return `Updated ${vacationEvents.length} vacation events`;
};

export default migrate;
