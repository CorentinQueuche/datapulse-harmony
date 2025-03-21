import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from 'date-fns';
import { CalendarIcon } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit comporter au moins 2 caractères.",
  }),
  description: z.string().optional(),
  sourceId: z.string().min(1, {
    message: "Veuillez sélectionner une source.",
  }),
  startDate: z.date(),
  endDate: z.date(),
  metrics: z.array(z.string()).min(1, {
    message: "Veuillez sélectionner au moins une métrique.",
  }),
  dimensions: z.array(z.string()).min(1, {
    message: "Veuillez sélectionner au moins une dimension.",
  }),
  filters: z.record(z.any()).optional(),
});

interface CreateReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CreateReportModal: React.FC<CreateReportModalProps> = ({ open, onOpenChange, onSuccess }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sources, setSources] = useState<{ id: string; name: string; }[]>([]);

  useEffect(() => {
    const fetchSources = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('analytics_sources')
        .select('id, name')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching sources:', error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les sources analytics",
          variant: "destructive",
        });
        return;
      }

      setSources(data.map(source => ({ id: source.id, name: source.name })));
    };

    fetchSources();
  }, [user]);

  const { control, handleSubmit, formState: { errors }, setValue } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      sourceId: "",
      startDate: new Date(),
      endDate: new Date(),
      metrics: ['activeUsers'],
      dimensions: ['date'],
      filters: {},
    },
  });

  const createReport = async (values: z.infer<typeof formSchema>) => {
    if (!user || !values.sourceId) return;
  
    setIsSubmitting(true);
    
    try {
      // Use RPC function instead of direct table insert
      const { data, error } = await supabase.rpc('create_analytics_report', {
        p_user_id: user.id,
        p_name: values.name,
        p_description: values.description || null,
        p_source_id: values.sourceId,
        p_start_date: values.startDate.toISOString(),
        p_end_date: values.endDate.toISOString(),
        p_metrics: values.metrics,
        p_dimensions: values.dimensions,
        p_filters: values.filters || null
      });

      if (error) throw error;
      
      toast({
        title: "Rapport créé",
        description: "Le rapport a été créé avec succès",
      });
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating report:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le rapport",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer un rapport Analytics</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(createReport)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nom</Label>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input id="name" placeholder="Nom du rapport" {...field} />
              )}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <Input id="description" placeholder="Description du rapport" {...field} />
              )}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sourceId">Source Analytics</Label>
            <Controller
              control={control}
              name="sourceId"
              render={({ field }) => (
                <Select onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une source" defaultValue={field.value} />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map((source) => (
                      <SelectItem key={source.id} value={source.id}>{source.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.sourceId && (
              <p className="text-sm text-red-500">{errors.sourceId.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Date de début</Label>
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[150px] justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? format(field.value, "PPP") : (
                          <span>Choisir une date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date()
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Date de fin</Label>
              <Controller
                control={control}
                name="endDate"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[150px] justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? format(field.value, "PPP") : (
                          <span>Choisir une date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date()
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate.message}</p>
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="metrics">Métriques</Label>
            <Controller
              control={control}
              name="metrics"
              render={({ field }) => (
                <Select onValueChange={(value) => {
                  field.onChange([value]);
                  setValue('metrics', [value]);
                }}
                defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une métrique" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activeUsers">Utilisateurs actifs</SelectItem>
                    <SelectItem value="newUsers">Nouveaux utilisateurs</SelectItem>
                    <SelectItem value="sessions">Sessions</SelectItem>
                    <SelectItem value="pageviews">Vues de page</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.metrics && (
              <p className="text-sm text-red-500">{errors.metrics.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dimensions">Dimensions</Label>
            <Controller
              control={control}
              name="dimensions"
              render={({ field }) => (
                <Select onValueChange={(value) => {
                  field.onChange([value]);
                  setValue('dimensions', [value]);
                }}
                defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une dimension" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="source">Source</SelectItem>
                    <SelectItem value="channel">Canal</SelectItem>
                    <SelectItem value="country">Pays</SelectItem>
                    <SelectItem value="device">Appareil</SelectItem>
                    <SelectItem value="browser">Navigateur</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.dimensions && (
              <p className="text-sm text-red-500">{errors.dimensions.message}</p>
            )}
          </div>
          {/* Filters could be added here in the future */}
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateReportModal;
