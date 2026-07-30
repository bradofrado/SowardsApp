import { syncTransactionsForItem } from "api/src/services/budget";
import { logger } from "api/src/utils/logger";
import { NextRequest, NextResponse } from "next/server";

interface PlaidWebhookBody {
  webhook_type?: string;
  webhook_code?: string;
  item_id?: string;
}

export async function POST(req: NextRequest) {
  let body: PlaidWebhookBody;
  try {
    body = (await req.json()) as PlaidWebhookBody;
  } catch (error) {
    logger.error({
      message: "Failed to parse Plaid webhook body",
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { webhook_type, webhook_code, item_id } = body;

  // We only care about the transactions sync notification. Acknowledge any
  // other webhook so Plaid does not retry it.
  if (
    webhook_type !== "TRANSACTIONS" ||
    webhook_code !== "SYNC_UPDATES_AVAILABLE"
  ) {
    return NextResponse.json({ received: true });
  }

  if (!item_id) {
    logger.error({
      message: "Plaid SYNC_UPDATES_AVAILABLE webhook missing item_id",
    });
    return NextResponse.json({ error: "Missing item_id" }, { status: 400 });
  }

  try {
    const synced = await syncTransactionsForItem(item_id);

    if (!synced) {
      logger.error({
        message: "Plaid webhook for unknown item",
        itemId: item_id,
      });
      return NextResponse.json({ error: "Unknown item" }, { status: 404 });
    }

    logger.info({
      message: "Synced transactions from Plaid webhook",
      itemId: item_id,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error({
      message: "Error syncing transactions from Plaid webhook",
      itemId: item_id,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
