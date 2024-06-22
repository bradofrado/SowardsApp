"use client";
import { Label } from "ui/src/components/core/label";
import { Input, InputBlur } from "ui/src/components/core/input";
import { useEffect, useMemo, useState } from "react";
import { useChangeProperty } from "ui/src/hooks/change-property";
import { Button } from "ui/src/components/catalyst/button";
import type { CalendarEvent } from "ui/src/components/core/calendar/calendar";
import type { TimeRangeValue } from "ui/src/components/core/calendar/time-picker";
import { TimeRangeInput } from "ui/src/components/core/calendar/time-picker";
import { DatePicker } from "ui/src/components/core/calendar/date-picker";
import type { AmountType, VacationEvent } from "model/src/vacation";
import type { DropdownItem } from "ui/src/components/core/dropdown";
import { Dropdown } from "ui/src/components/core/dropdown";
import { useUser } from "./user-provider";
import { isUserAmount } from "./stats-view";
import { displayDate, displayTime, formatDollarAmount } from "model/src/utils";
import {
  DialogTitle,
  DialogDescription,
  Dialog,
  DialogBody,
  DialogActions,
} from "ui/src/components/catalyst/dialog";
import { usePrevious } from "ui/src/hooks/previous";
import {
  DescriptionList,
  DescriptionDetails,
  DescriptionTerm,
} from "ui/src/components/catalyst/description-list";

type EventAmount = Event["amounts"][number];
type EventAmountType = AmountType;
export interface Event extends CalendarEvent, VacationEvent {}

interface EventFormProps {
  event: Event;
  onSave: (event: Event) => void;
  onRemove: (event: Event) => void;
  onJoin: (event: Event) => void;
  onLeave: (event: Event) => void;
  existingEvent: boolean;
  joined: boolean;
  inGroup: boolean;
}
interface EventFormModalProps extends EventFormProps {
  show: boolean;
  onClose: () => void;
  canEdit: boolean;
}
export const EventFormModal: React.FunctionComponent<EventFormModalProps> = ({
  show,
  onClose,
  onSave,
  onJoin,
  onLeave,
  onRemove,
  canEdit,
  ...rest
}) => {
  const [edit, onEdit] = useState(!rest.existingEvent);
  const prevExistingEvent = usePrevious(rest.existingEvent);
  useEffect(() => {
    if (prevExistingEvent !== rest.existingEvent) onEdit(!rest.existingEvent);
  }, [prevExistingEvent, rest.existingEvent]);
  const closeIt =
    <Props, Ret>(func: (props: Props) => Ret) =>
    (prop: Props): Ret => {
      const ret = func(prop);
      onClose();
      return ret;
    };
  return (
    <Dialog onClose={onClose} open={show}>
      {edit ? (
        <EventForm
          onJoin={closeIt(onJoin)}
          onLeave={closeIt(onLeave)}
          onRemove={closeIt(onRemove)}
          onSave={closeIt(onSave)}
          onView={() => {
            onEdit(!edit);
          }}
          {...rest}
        />
      ) : (
        <EventDetails
          canEdit={canEdit}
          onJoin={closeIt(onJoin)}
          onLeave={closeIt(onLeave)}
          onEdit={() => {
            onEdit(!edit);
          }}
          {...rest}
        />
      )}
    </Dialog>
  );
};

interface EventDetailsProps {
  onJoin: (event: VacationEvent) => void;
  onLeave: (event: VacationEvent) => void;
  onEdit: () => void;
  event: VacationEvent;
  joined: boolean;
  inGroup: boolean;
  canEdit: boolean;
}
export const EventDetails: React.FunctionComponent<EventDetailsProps> = ({
  event,
  joined,
  canEdit,
  onLeave,
  onJoin,
  onEdit,
  inGroup,
}) => {
  return (
    <div className="flex flex-col">
      <DialogTitle>{event.name}</DialogTitle>
      <DialogDescription>{event.notes}</DialogDescription>
      <DialogBody className="space-y-4">
        <DescriptionList>
          <DescriptionTerm>Date</DescriptionTerm>
          <DescriptionDetails>{displayDate(event.date)}</DescriptionDetails>

          <DescriptionTerm>Time</DescriptionTerm>
          <DescriptionDetails>{displayTime(event.date)}</DescriptionDetails>

          <DescriptionTerm>Location</DescriptionTerm>
          <DescriptionDetails>{event.location || "N/A"}</DescriptionDetails>

          <DescriptionTerm>Links</DescriptionTerm>
          <DescriptionDetails>
            <div className="flex flex-col gap-2">
              {event.links.length
                ? event.links.map((link) => (
                    <a
                      className="text-blue-500"
                      target="_blank"
                      key={link}
                      href={link}
                      rel="noopener"
                    >
                      {link}
                    </a>
                  ))
                : "N/A"}
            </div>
          </DescriptionDetails>

          <DescriptionTerm>Amount</DescriptionTerm>
          <DescriptionDetails>
            <div className="flex flex-col gap-2">
              {event.amounts.map((amount) => (
                <div
                  key={`${amount.amount}-${amount.type}`}
                  className="flex gap-2"
                >
                  <div>{formatDollarAmount(amount.amount)}</div>
                  <span>-</span>
                  <div>{amount.type}</div>
                </div>
              ))}
            </div>
          </DescriptionDetails>
        </DescriptionList>
      </DialogBody>
      <DialogActions>
        {!inGroup ? (
          <div className="mt-8 flex flex-col-reverse items-center justify-end gap-3 *:w-full sm:flex-row sm:*:w-auto">
            {!joined ? (
              <Button
                onClick={() => {
                  onJoin(event);
                }}
              >
                Join
              </Button>
            ) : (
              <Button
                onClick={() => {
                  onLeave(event);
                }}
              >
                Leave
              </Button>
            )}
            {canEdit ? <Button onClick={onEdit}>Edit</Button> : null}
          </div>
        ) : null}
      </DialogActions>
    </div>
  );
};

export const EventForm: React.FunctionComponent<
  EventFormProps & { onView: () => void }
> = ({
  event: eventProp,
  onSave,
  onRemove,
  onJoin,
  onLeave,
  onView,
  existingEvent,
  joined,
  inGroup,
}) => {
  const [event, setEvent] = useState<Event>(eventProp);
  const changeProperty = useChangeProperty<Event>(setEvent);

  return (
    <div>
      <DialogTitle>{existingEvent ? "Edit Event" : "Add Event"}</DialogTitle>
      <DialogBody className="space-y-4">
        <Label label="Name">
          <Input
            className="w-full"
            onChange={changeProperty.formFunc("name", event)}
            value={event.name}
          />
        </Label>
        <Label label="Date">
          <DatePicker
            date={event.date}
            onChange={changeProperty.formFunc("date", event)}
          />
        </Label>
        <Label label="Time">
          <TimeRangeInput
            onChange={setEvent as (value: TimeRangeValue) => void}
            value={event}
          />
        </Label>
        <Label label="Location">
          <Input
            className="w-full"
            onChange={changeProperty.formFunc("location", event)}
            value={event.location}
          />
        </Label>
        <Label label="Links">
          <LinkFields
            onChange={changeProperty.formFunc("links", event)}
            value={event.links}
          />
        </Label>
        <Label label="Amount">
          <AmountFields
            amounts={event.amounts}
            onChange={changeProperty.formFunc("amounts", event)}
          />
        </Label>
        <Label label="Notes">
          <Input
            className="w-full min-h-[80px]"
            onChange={changeProperty.formFunc("notes", event)}
            type="textarea"
            value={event.notes}
          />
        </Label>
      </DialogBody>
      <DialogActions>
        <Button
          onClick={() => {
            onSave(event);
          }}
        >
          Save
        </Button>
        {existingEvent ? (
          <>
            <Button
              onClick={() => {
                onRemove(event);
              }}
            >
              Delete
            </Button>
            {!inGroup ? (
              <>
                {!joined ? (
                  <Button
                    onClick={() => {
                      onJoin(event);
                    }}
                  >
                    Join
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      onLeave(event);
                    }}
                  >
                    Leave
                  </Button>
                )}
              </>
            ) : null}
          </>
        ) : null}
        {existingEvent ? <Button onClick={onView}>View Details</Button> : null}
      </DialogActions>
    </div>
  );
};

const LinkFields: React.FunctionComponent<{
  value: string[];
  onChange: (value: string[]) => void;
}> = ({ value: values, onChange }) => {
  const onAmountChange = (value: string, index: number): void => {
    if (index < 0 || index >= values.length) return;

    const copy = values.slice();
    copy[index] = value;
    onChange(copy);
  };

  const onAmountRemove = (index: number): void => {
    if (index < 0 || index >= values.length) return;

    const copy = values.slice();
    copy.splice(index, 1);
    onChange(copy);
  };

  const onAmountAdd = (): void => {
    const copy = values.slice();
    copy.push("https://google.com");
    onChange(copy);
  };

  return (
    <div>
      {values.map((link, i) => (
        <div className="flex gap-2" key={link}>
          <InputBlur
            onChange={(value) => {
              onAmountChange(value, i);
            }}
            value={link}
          />
          <Button
            onClick={() => {
              onAmountRemove(i);
            }}
          >
            Remove
          </Button>
        </div>
      ))}
      <Button className="mt-2" onClick={onAmountAdd}>
        Add
      </Button>
    </div>
  );
};

const AmountFields: React.FunctionComponent<{
  amounts: EventAmount[];
  onChange: (value: EventAmount[]) => void;
}> = ({ amounts, onChange }) => {
  const { user } = useUser();
  const filteredAmounts = useMemo(
    () => amounts.filter((amount) => isUserAmount(amount, user?.id)),
    [amounts, user],
  );

  const onAmountChange = (value: EventAmount, index: number): void => {
    if (index < 0 || index >= amounts.length) return;

    const copy = amounts.slice();
    copy[index] = value;
    onChange(copy);
  };

  const onAmountRemove = (index: number): void => {
    if (index < 0 || index >= amounts.length) return;

    const copy = amounts.slice();
    copy.splice(index, 1);
    onChange(copy);
  };

  const onAmountAdd = (): void => {
    const copy = amounts.slice();
    copy.push({ amount: 5, type: "custom", createdById: user?.id || "" });
    onChange(copy);
  };

  return (
    <div>
      {filteredAmounts.map((amount, i) => (
        <AmountField
          key={amount.type}
          onChange={(value) => {
            onAmountChange(value, i);
          }}
          onRemove={() => {
            onAmountRemove(i);
          }}
          value={amount}
        />
      ))}
      <Button className="mt-2" onClick={onAmountAdd}>
        Add
      </Button>
    </div>
  );
};

interface AmountFieldProps {
  value: EventAmount;
  onChange: (value: EventAmount) => void;
  onRemove: () => void;
}
const AmountField: React.FunctionComponent<AmountFieldProps> = ({
  value,
  onChange,
  onRemove,
}) => {
  const changeProperty = useChangeProperty<EventAmount>(onChange);
  const items: DropdownItem<EventAmountType>[] = [
    {
      id: "adult",
      name: "Adult",
    },
    {
      id: "child",
      name: "Child",
    },
    {
      id: "custom",
      name: "Custom",
    },
  ];
  return (
    <div>
      <div className="flex gap-2">
        <Input
          onChange={(val) => changeProperty(value, "amount", Number(val))}
          value={value.amount}
        />
        <Dropdown
          initialValue={value.type}
          items={items}
          onChange={(item) => changeProperty(value, "type", item.id)}
        >
          Select Type
        </Dropdown>
        <Button onClick={onRemove}>Remove</Button>
      </div>
    </div>
  );
};
