"use client";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Avatar } from "ui/src/components/catalyst/avatar";
import { Badge } from "ui/src/components/catalyst/badge";
import { Divider } from "ui/src/components/catalyst/divider";
import { Heading, Subheading } from "ui/src/components/catalyst/heading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "ui/src/components/catalyst/table";
import { StatsView, useCalculateStats } from "./plan/components/stats-view";
import { UserVacation, VacationEvent } from "model/src/vacation";
import { formatDollarAmount } from "model/src/utils";

export const Home: React.FunctionComponent<{
  events: VacationEvent[];
}> = ({ events }) => {
  const user = useUser();
  if (!user.isSignedIn) {
    redirect("/plan");
  }

  const orders = []; //await getRecentOrders()

  return (
    <>
      <Heading>Good afternoon, {user.user.firstName}</Heading>
      <div className="mt-8 flex items-end justify-between">
        <Subheading>Overview</Subheading>
      </div>
      <StatsView events={events} groups={[]} />
      <Subheading className="mt-14">Upcoming Events</Subheading>
      <Table className="mt-4 [--gutter:theme(spacing.6)] lg:[--gutter:theme(spacing.10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Order number</TableHeader>
            <TableHeader>Purchase date</TableHeader>
            <TableHeader>Customer</TableHeader>
            <TableHeader>Event</TableHeader>
            <TableHeader className="text-right">Amount</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              href={order.url}
              title={`Order #${order.id}`}
            >
              <TableCell>{order.id}</TableCell>
              <TableCell className="text-zinc-500">{order.date}</TableCell>
              <TableCell>{order.customer.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar src={order.event.thumbUrl} className="size-6" />
                  <span>{order.event.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">US{order.amount.usd}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};
