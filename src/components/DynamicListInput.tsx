import * as z from 'zod'
import { KeyboardEvent, useCallback, useRef } from "react";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { toast } from 'sonner';

type DynamicListInputProps = {
  items: string[];
  setItems: React.Dispatch<React.SetStateAction<string[]>>;
};

const dynamicInputListSchema = (
  z.string()
  .max(40, "Only up to 40 characters is allowed")
  .regex(/^[a-zA-Z-]+$/, "Only letters and hyphens allowed")
)

export default function DynamicListInput({
  items,
  setItems,
}: DynamicListInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const addItem = useCallback(
    (value: string) => {
      if (!inputRef.current) return;

      setItems((prevItems) => [...prevItems, value.trim()]);
      inputRef.current.value = "";
    },
    [setItems],
  );

  const popItem = useCallback(() => {
    if (!inputRef.current) return;
    setItems((prevItems) => prevItems.slice(0, items.length - 1));
  }, [items.length, setItems]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      const inputValue = inputRef.current?.value;

      if (event.key == " " && inputValue?.trim() !== "") {
        if (!inputValue) return;
        event.preventDefault();
        const ingredient = inputValue.trim();
        const parseResult = dynamicInputListSchema.safeParse(ingredient)

        if (parseResult.error) {
          toast.error(parseResult.error.formErrors.formErrors[0]) 
          return
        }

        addItem(parseResult.data);
      } else if (
        event.key === "Backspace" &&
        inputValue === "" &&
        items.length
      ) {
        popItem();
      }
    },
    [addItem, items, popItem],
  );

  return (
    <>
      <div className="w-full rounded-xl border bg-secondary p-4">
        {items.length > 0 && (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-start gap-1 px-2">
              {items.map((item, index) => (
                <Badge
                  key={`${item}-${index}`}
                  className="font-normal"
                  variant={"default"}
                >
                  {item}{" "}
                </Badge>
              ))}
            </div>
          </>
        )}

        <Input
          className="border-none shadow-none focus-visible:ring-0"
          ref={inputRef}
          onKeyDown={handleKeyDown}
          placeholder={"Type and press space to add ingredients"}
        />
      </div>
    </>
  );
}
