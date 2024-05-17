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
  defaultValue: EdgeData["string"];
};

const FormSchema = z.object({
  c: z.string().regex(/^[f+\-*/\d.]+$/, "Неправильний формат"),
  z: z.string().regex(/^[f+\-*/\d.]+$/, "Неправильний формат"),
  r: z.string().regex(/^[f+\-*/\d.]+$/, "Неправильний формат"),
  alpha: z.string().regex(/^(0\.(?!0+$)\d+)$/, "Неправильний формат"),
});

export const EdgeDialog: React.FC<Props> = ({
  selectedEdge,
  onClose,
  setEdgeData,
  defaultValue,
}) => {
  const edgeId = selectedEdge;
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: defaultValue,
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
              <Label htmlFor="c">Функція операційних витрат ĉ(f)</Label>
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
              <Label htmlFor="z">Функція відбраковочних витрат ẑ(f)</Label>
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
              <Label htmlFor="r">Функція ризику r̂(f)</Label>
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
              <Label htmlFor="alpha">Відсоток залишку після втрат α</Label>
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
