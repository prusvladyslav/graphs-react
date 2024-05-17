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
import { NodeData } from "@/App";

type Props = {
  selectedNode: string;
  onClose: VoidFunction;
  setNodeData: Dispatch<SetStateAction<NodeData>>;
  defaultValue: NodeData["string"];
};

const FormSchema = z.object({
  "lambda-": z.string().regex(/^[+\-*/\d.]+$/, "Неправильний формат"),
  "lambda+": z.string().regex(/^[+\-*/\d.]+$/, "Неправильний формат"),
  P_min: z.string().regex(/^[+\-*/\d.]+$/, "Неправильний формат"),
  P_max: z.string().regex(/^[+\-*/\d.]+$/, "Неправильний формат"),
});

export const NodeDialog: React.FC<Props> = ({
  selectedNode,
  onClose,
  setNodeData,
  defaultValue,
}) => {
  const nodeId = selectedNode;
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: defaultValue,
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setNodeData((prev) => {
      const newState = { ...prev };

      newState[nodeId] = data;

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
            Параметри Вершини <span className="underline">{nodeId}</span>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="c">Штраф за надлишок λ+</Label>
              <FormField
                control={form.control}
                name="lambda+"
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
              <Label htmlFor="z">Штраф за нестачу λ-</Label>
              <FormField
                control={form.control}
                name="lambda-"
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
              <Label htmlFor="P_min">
                Межа рівномірного розподілу P<sub>min</sub>
              </Label>
              <FormField
                control={form.control}
                name="P_min"
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
              <Label htmlFor="P_max">
                {" "}
                Межа рівномірного розподілу P<sub>max</sub>
              </Label>
              <FormField
                control={form.control}
                name="P_max"
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
