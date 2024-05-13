import { EdgeData } from "@/App";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

type Props = {
  selectedEdge: string;
  onClose: VoidFunction;
  setEdgeData: Dispatch<SetStateAction<EdgeData>>;
};

const FormSchema = z.object({
  c: z.string().regex(/^[f+\-*/\d.]+$/, "Неправильний формат"),
  z: z.string().regex(/^[f+\-*/\d.]+$/, "Неправильний формат"),
  r: z.string().regex(/^[f+\-*/\d.]+$/, "Неправильний формат"),
  alpha: z.preprocess((value) => {
    if (typeof value === "string") {
      const parsed = Number(value);
      if (!isNaN(parsed) && isFinite(parsed)) {
        return parsed;
      }
    }
    return value;
  }, z.number({ message: "Неправильний формат" }).min(0, "Число має бути не меншим за 0").max(1, "Число має бути не більшим за 1")),
});

export const EdgeDialog: React.FC<Props> = ({
  selectedEdge,
  onClose,
  setEdgeData,
}) => {
  const edgeId = selectedEdge.split("edge-")[1];
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      c: "f**2+11*f",
      z: "0",
      r: "0",
      alpha: 1,
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setEdgeData((prev) => {
      const newState = { ...prev };

      newState[edgeId] = data;

      return newState;
    });
    onClose();
  }

  return (
    <Dialog open={true}>
      <DialogContent
        className="sm:max-w-[425px]"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        onClose={() => onClose()}
      >
        <DialogHeader className="flex justify-between">
          <DialogTitle>
            Enter functions for edge <span className="underline">{edgeId}</span>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="c">Function ĉ</Label>
              <FormField
                control={form.control}
                name="c"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="c">Function ẑ</Label>
              <FormField
                control={form.control}
                name="z"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="c">Function r̂</Label>
              <FormField
                control={form.control}
                name="r"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="alpha">Alpha</Label>
              <FormField
                control={form.control}
                name="alpha"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Apply</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
