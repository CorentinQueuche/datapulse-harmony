
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { toast } from '@/components/ui/use-toast';
import { format, sub } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  description: z.string().optional(),
  source_id: z.string().min(1, 'Veuillez sélectionner une source'),
  start_date: z.date(),
  end_date: z.date(),
  metrics: z.array(z.string()).min(1, 'Sélectionnez au moins une métrique'),
  dimensions: z.array(z.string()).min(1, 'Sélectionnez au moins une dimension'),
});

type FormValues = z.infer<typeof formSchema>;

// Available metrics and dimensions for Google Analytics
const availableMetrics = [
  { id: 'activeUsers', label: 'Utilisateurs actifs' },
  { id: 'newUsers', label: 'Nouveaux utilisateurs' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'engagementRate', label: "Taux d'engagement" },
  { id: 'eventsPerSession', label: 'Événements par session' },
  { id: 'conversions', label: 'Conversions' },
  { id: 'pageviews', label: 'Pages vues' },
  { id: 'screenPageViews', label: 'Vues de page/écran' },
  { id: 'averageSessionDuration', label: 'Durée moyenne de session' },
  { id: 'bounceRate', label: 'Taux de rebond' },
];

const availableDimensions = [
  { id: 'date', label: 'Date' },
  { id: 'deviceCategory', label: 'Catégorie d\'appareil' },
  { id: 'country', label: 'Pays' },
  { id: 'city', label: 'Ville' },
  { id: 'browser', label: 'Navigateur' },
  { id: 'operatingSystem', label: 'Système d\'exploitation' },
  { id: 'channelGrouping', label: 'Canal d\'acquisition' },
  { id: 'source', label: 'Source' },
  { id: 'medium', label: 'Medium' },
  { id: 'campaign', label: 'Campagne' },
];

const CreateReportModal: React.FC<CreateReportModalProps> = ({ isOpen, onClose }) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>(['date']);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      source_id: '',
      start_date: sub(new Date(), { days: 30 }),
      end_date: new Date(),
      metrics: ['activeUsers'],
      dimensions: ['date'],
    },
  });

  // Fetch analytics sources
  const { data: sources, isLoading: isLoadingSources } = useQuery({
    queryKey: ['analyticsSources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_sources')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Create report mutation
  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { error } = await supabase.rpc('create_analytics_report', {
        p_name: values.name,
        p_description: values.description || '',
        p_source_id: values.source_id,
        p_start_date: format(values.start_date, 'yyyy-MM-dd'),
        p_end_date: format(values.end_date, 'yyyy-MM-dd'),
        p_metrics: values.metrics,
        p_dimensions: values.dimensions,
        p_filters: {}
      });

      if (error) throw new Error(error.message);
      return values;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyticsReports'] });
      toast({
        title: "Rapport créé",
        description: "Le rapport a été créé avec succès.",
      });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Une erreur est survenue: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (values: FormValues) => {
    // Update the form values with selected metrics and dimensions
    values.metrics = selectedMetrics;
    values.dimensions = selectedDimensions;
    createMutation.mutate(values);
  };

  // Reset the form when the modal is closed
  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setSelectedMetrics(['activeUsers']);
      setSelectedDimensions(['date']);
    }
  }, [isOpen, form]);

  // Handle metric checkbox changes
  const handleMetricChange = (metricId: string, checked: boolean) => {
    if (checked) {
      setSelectedMetrics([...selectedMetrics, metricId]);
    } else {
      setSelectedMetrics(selectedMetrics.filter(id => id !== metricId));
    }
  };

  // Handle dimension checkbox changes
  const handleDimensionChange = (dimensionId: string, checked: boolean) => {
    if (checked) {
      setSelectedDimensions([...selectedDimensions, dimensionId]);
    } else {
      if (dimensionId !== 'date' || selectedDimensions.length > 1) {
        setSelectedDimensions(selectedDimensions.filter(id => id !== dimensionId));
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un nouveau rapport</DialogTitle>
          <DialogDescription>
            Configurez les paramètres de votre rapport analytics.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du rapport</FormLabel>
                  <FormControl>
                    <Input placeholder="Mon rapport analytics" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Description du rapport (optionnel)" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="source_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source de données</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingSources ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>Chargement...</span>
                        </div>
                      ) : sources && sources.length > 0 ? (
                        sources.map((source) => (
                          <SelectItem key={source.id} value={source.id}>
                            {source.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-center text-sm text-gray-500">
                          Aucune source disponible
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de début</FormLabel>
                    <DatePicker 
                      date={field.value} 
                      setDate={field.onChange} 
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de fin</FormLabel>
                    <DatePicker 
                      date={field.value} 
                      setDate={field.onChange} 
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="metrics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Métriques</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {availableMetrics.map((metric) => (
                      <div key={metric.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`metric-${metric.id}`} 
                          checked={selectedMetrics.includes(metric.id)}
                          onCheckedChange={(checked) => 
                            handleMetricChange(metric.id, checked as boolean)
                          }
                        />
                        <label 
                          htmlFor={`metric-${metric.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {metric.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  {form.formState.errors.metrics && (
                    <p className="text-sm font-medium text-destructive mt-2">
                      {form.formState.errors.metrics.message}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dimensions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dimensions</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {availableDimensions.map((dimension) => (
                      <div key={dimension.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`dimension-${dimension.id}`} 
                          checked={selectedDimensions.includes(dimension.id)}
                          disabled={dimension.id === 'date' && selectedDimensions.length === 1}
                          onCheckedChange={(checked) => 
                            handleDimensionChange(dimension.id, checked as boolean)
                          }
                        />
                        <label 
                          htmlFor={`dimension-${dimension.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {dimension.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  {form.formState.errors.dimensions && (
                    <p className="text-sm font-medium text-destructive mt-2">
                      {form.formState.errors.dimensions.message}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={createMutation.isPending}
              >
                Annuler
              </Button>
              <Button 
                type="submit"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Créer le rapport
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateReportModal;
