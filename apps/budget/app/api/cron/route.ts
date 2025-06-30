import { prisma } from "db/lib/prisma";
import { getAllActiveUserVacations } from "api/src/repositories/budget/user-vacation";
import {
  updateExpiredBudgets,
  processAutomatedTransfers,
} from "api/src/services/budget-updates";
import { logger } from "api/src/utils/logger";
import { NextRequest } from "next/server";

interface CronResponse {
  success: boolean;
  successCount?: number;
  errorCount?: number;
  error?: string;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  try {
    logger.info({
      message: "Starting budget updates job",
    });
    const users = await getAllActiveUserVacations(prisma);

    let successCount = 0;
    let errorCount = 0;

    // Process users sequentially to avoid overwhelming the database
    for (const user of users) {
      try {
        logger.info({
          message: "Processing user",
          userId: user.id,
        });
        const createdCount = await updateExpiredBudgets(prisma, user);
        const processedCount = await processAutomatedTransfers(prisma, user);
        successCount++;
        logger.info({
          message: "Successfully processed user",
          userId: user.id,
          createdCount,
          processedCount,
        });
      } catch (error) {
        errorCount++;
        logger.error({
          message: "Error processing user",
          userId: user.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    logger.info({
      message: "Cron job completed",
      successCount,
      errorCount,
    });

    return new Response("Cron job completed", {
      status: 200,
    });
  } catch (error) {
    logger.error({
      message: "Critical error in cron job",
      error: error instanceof Error ? error.message : String(error),
    });
    return new Response("Internal server error", {
      status: 500,
    });
  }
}
