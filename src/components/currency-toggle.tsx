"use client";

import { useCurrency } from "@/components/currency-provider";
import { Euro, CircleDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CurrencyToggle() {
  const { displayCurrency, setDisplayCurrency } = useCurrency();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() =>
            setDisplayCurrency(displayCurrency === "EUR" ? "ALL" : "EUR")
          }
        >
          {displayCurrency === "EUR" ? (
            <Euro className="h-4 w-4" />
          ) : (
            <span className="text-sm font-bold">L</span>
          )}
          <span className="sr-only">Toggle display currency</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          Viewing in {displayCurrency === "EUR" ? "Euro (€)" : "Lek (L)"}.
          Click to switch.
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
