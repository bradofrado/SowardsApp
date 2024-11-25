"use client";
import { Heading, Subheading } from "ui/src/components/catalyst/heading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "ui/src/components/catalyst/table";
import type { UserVacation, VacationEvent } from "model/src/vacation";
import { displayDateAndTime, formatDollarAmount } from "model/src/utils";
import { useMemo } from "react";
import { useUser } from "./plan/components/user-provider";
import { getAmountForEvent, StatsView } from "./plan/components/stats-view";

export const Home: React.FunctionComponent<{
  events: VacationEvent[];
  users: UserVacation[];
}> = ({ events, users }) => {
  const { user } = useUser();
  const userEvents = useMemo(
    () => events.filter((event) => event.userIds.includes(user?.id || "")),
    [events, user?.id],
  );

  return (
    <>
      <Heading>Good afternoon, {user?.name.split(" ")[0]}</Heading>
      <div className="mt-8 flex items-end justify-between">
        <Subheading>Overview</Subheading>
      </div>
      <StatsView events={events} groups={[]} />
      <Subheading className="mt-14">Upcoming Events</Subheading>
      <Table className="mt-4 [--gutter:theme(spacing.6)] lg:[--gutter:theme(spacing.10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Date</TableHeader>
            <TableHeader className="hidden lg:block">Created By</TableHeader>
            <TableHeader className="text-right">Amount</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {userEvents.map((event) => (
            <TableRow key={event.id} title={`Event #${event.id}`}>
              <TableCell>{event.name}</TableCell>
              <TableCell className="text-zinc-500">
                {displayDateAndTime(event.date)}
              </TableCell>
              <TableCell className="hidden lg:block">
                {users.find((_user) => _user.id === event.createdById)?.name ||
                  "N/A"}
              </TableCell>
              {/* <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar src={event.event.thumbUrl} className="size-6" />
                  <span>{event.event.name}</span>
                </div>
              </TableCell> */}
              <TableCell className="text-right">
                {formatAmount(getAmountForEvent(event, user).total)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

function formatAmount(amount: number): string {
  return amount > 0 ? formatDollarAmount(amount) : "";
}
