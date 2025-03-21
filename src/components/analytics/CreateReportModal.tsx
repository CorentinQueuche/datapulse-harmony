
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères' }),
  description: z.string().optional(),
  source_id: z.string().min(2, { message: 'Veuillez sélectionner une source' }),
  start_date: z.date({ required_error: 'Veuillez sélectionner une date de début' }),
  end_date: z.date({ required_error: 'Veuillez sélectionner une date de fin' }),
  metrics: z.array(z.string()).min(1, { message: 'Sélectionnez au moins une métrique' }),
  dimensions: z.array(z.string()).min(1, { message: 'Sélectionnez au moins une dimension' }),
});

const availableMetrics = [
  { label: 'Utilisateurs actifs', value: 'activeUsers' },
  { label: 'Nouveaux utilisateurs', value: 'newUsers' },
  { label: 'Sessions', value: 'sessions' },
  { label: 'Taux de rebond', value: 'bounceRate' },
  { label: 'Durée moyenne de session', value: 'avgSessionDuration' },
  { label: 'Pages vues', value: 'pageviews' },
  { label: 'Pages par session', value: 'pagesPerSession' },
  { label: 'Taux de conversion', value: 'conversionRate' },
];

const availableDimensions = [
  { label: 'Date', value: 'date' },
  { label: 'Semaine', value: 'week' },
  { label: 'Mois', value: 'month' },
  { label: 'Pays', value: 'country' },
  { label: 'Ville', value: 'city' },
  { label: 'Appareil', value: 'device' },
  { label: 'Canal', value: 'channel' },
  { label: 'Source', value: 'source' },
  { label: 'Navigateur', value: 'browser' },
  { label: 'Système d\'exploitation', value: 'operatingSystem' },
  { label: 'Page', value: 'page' },
];

const CreateReportModal: React.FC<CreateReportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [openStartDate, setOpenStartDate] = useState(false);
  const [openEndDate, setOpenEndDate] = useState(false);
  const [openMetrics, setOpenMetrics] = useState(false);
  const [openDimensions, setOpenDimensions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      source_id: '',
      start_date: undefined,
      end_date: undefined,
      metrics: ['activeUsers'],
      dimensions: ['date'],
    },
  });
  
  // Récupérer les sources d'analytics disponibles
  const { data: sources } = useQuery({
    queryKey: ['analyticsSources', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_sources')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && isOpen,
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('analytics_reports').insert({
        user_id: user.id,
        name: values.name,
        description: values.description || null,
        source_id: values.source_id,
        start_date: format(values.start_date, 'yyyy-MM-dd'),
        end_date: format(values.end_date, 'yyyy-MM-dd'),
        metrics: values.metrics,
        dimensions: values.dimensions,
        filters: {},
      });
      
      if (error) throw error;
      
      toast({
        title: "Rapport créé",
        description: "Le rapport a été créé avec succès.",
      });
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création du rapport.",
        variant: "destructive",
      });
      console.error("Erreur de création:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isMetricSelected = (value: string) => form.getValues().metrics.includes(value);
  const isDimensionSelected = (value: string) => form.getValues().dimensions.includes(value);
  
  const toggleMetric = (value: string) => {
    const current = form.getValues().metrics;
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    
    form.setValue('metrics', updated, { shouldValidate: true });
  };
  
  const toggleDimension = (value: string) => {
    const current = form.getValues().dimensions;
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    
    form.setValue('dimensions', updated, { shouldValidate: true });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau rapport</DialogTitle>
          <DialogDescription>
            Configurez les paramètres de votre rapport d'analytics personnalisé.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du rapport</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Rapport mensuel du site web" {...field} />
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
                  <FormLabel>Description (optionnelle)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ajoutez une description pour ce rapport..." 
                      className="resize-none min-h-[80px]"
                      {...field}
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
                  <FormLabel>Source d'analytics</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une source d'analytics" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sources?.map((source) => (
                        <SelectItem key={source.id} value={source.id}>
                          {source.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de début</FormLabel>
                    <Popover open={openStartDate} onOpenChange={setOpenStartDate}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PP', { locale: fr })
                            ) : (
                              <span>Choisir une date</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setOpenStartDate(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                    <Popover open={openEndDate} onOpenChange={setOpenEndDate}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PP', { locale: fr })
                            ) : (
                              <span>Choisir une date</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setOpenEndDate(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="metrics"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Métriques</FormLabel>
                  <Popover open={openMetrics} onOpenChange={setOpenMetrics}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "justify-between",
                            !field.value.length && "text-muted-foreground"
                          )}
                        >
                          {field.value.length > 0
                            ? `${field.value.length} métriques sélectionnées`
                            : "Sélectionner des métriques"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[250px] p-0">
                      <Command>
                        <CommandInput placeholder="Rechercher une métrique..." />
                        <CommandEmpty>Aucune métrique trouvée.</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-y-auto">
                          {availableMetrics.map((metric) => (
                            <CommandItem
                              key={metric.value}
                              onSelect={() => toggleMetric(metric.value)}
                              className="flex items-center gap-2"
                            >
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={isMetricSelected(metric.value)}
                                  onCheckedChange={() => toggleMetric(metric.value)}
                                />
                                {metric.label}
                              </div>
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  isMetricSelected(metric.value) ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dimensions"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Dimensions</FormLabel>
                  <Popover open={openDimensions} onOpenChange={setOpenDimensions}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "justify-between",
                            !field.value.length && "text-muted-foreground"
                          )}
                        >
                          {field.value.length > 0
                            ? `${field.value.length} dimensions sélectionnées`
                            : "Sélectionner des dimensions"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[250px] p-0">
                      <Command>
                        <CommandInput placeholder="Rechercher une dimension..." />
                        <CommandEmpty>Aucune dimension trouvée.</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-y-auto">
                          {availableDimensions.map((dimension) => (
                            <CommandItem
                              key={dimension.value}
                              onSelect={() => toggleDimension(dimension.value)}
                              className="flex items-center gap-2"
                            >
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={isDimensionSelected(dimension.value)}
                                  onCheckedChange={() => toggleDimension(dimension.value)}
                                />
                                {dimension.label}
                              </div>
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  isDimensionSelected(dimension.value) ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-analytics-blue hover:bg-analytics-blue/90 text-white"
              >
                {isSubmitting ? 'Création...' : 'Créer le rapport'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateReportModal;
