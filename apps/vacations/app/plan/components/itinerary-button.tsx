"use client";
import { useState } from "react";
import { Button } from "ui/src/components/catalyst/button";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "ui/src/components/catalyst/dialog";

interface ItineraryButtonProps {
  generateItinerary: (date: Date) => Promise<string>;
}
export const ItineraryButton: React.FunctionComponent<ItineraryButtonProps> = ({
  generateItinerary,
}) => {
  const [itinerary, setItinerary] = useState<string>();
  const [loading, setLoading] = useState(false);

  const onGenerate = (): void => {
    setLoading(true);
    void generateItinerary(new Date()).then((_itinerary) => {
      setItinerary(_itinerary);
      setLoading(false);
    });
  };

  const onClose = (): void => {
    setItinerary(undefined);
  };
  return (
    <>
      <Button loading={loading} onClick={onGenerate}>
        Itinerary
      </Button>
      <Dialog onClose={onClose} open={Boolean(itinerary)}>
        <div className="flex flex-col">
          <DialogTitle>Itinerary</DialogTitle>
          <DialogDescription>
            Here is the itenerary for the day
          </DialogDescription>
          <DialogBody className="space-y-4">
            {itinerary?.split("\n").map((line) => <p key={line}>{line}</p>)}
          </DialogBody>
          <DialogActions>
            <Button onClick={onClose}>Done</Button>
          </DialogActions>
        </div>
      </Dialog>
    </>
  );
};
